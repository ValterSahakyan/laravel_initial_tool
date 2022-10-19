<?php

namespace App\Http\Controllers;

use App\Models\Computation;
use App\Models\Node;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class Mol2gridController extends Controller
{

    function index($project, $run)
    {
        $data['result'] = DB::connection('mongodb')->collection($run)->paginate(10);
        $data['node'] = Node::where('run', $run)->first();
        $data['columns'] = $this->columns($run);
        $data['selected'] = DB::connection('mongodb')->collection($run)->pluck('Mol_ID');
        $data['filtered'] = $this->filtered($data['columns'], $run);
        $data['project'] = $project;
        $data['table'] = $run;
        return view('pages.mol2grid.index', compact('data'));
    }

    function fetch_data(Request $request, $project, $table)
    {
        if($request->ajax())
        {
            $data = $this->data($request, $table);
            $data['selected'] = $this->selectedMols($request, $table);;
            $data['table'] = $table;
            $data['project'] = $project;
            $check_all = $request->check_all;
            return view('pages.mol2grid.pagination_data', compact('data', 'check_all'))->render();
        }
    }

    public function data($request, $table)
    {
        $sort_by = $request->get('sortby');
        $sort_type = $request->get('sorttype');
        $query = $request->get('query');
        $query = str_replace(" ", "%", $query);
        $filters_arr = json_decode($request->get('filters_arr'));

        $data['node'] = Node::where('run', $table)->first();

        $data['columns'] = $cases = $this->columns($table);

        $data['filtered'] = $this->filtered($cases, $table);

        $result = DB::connection('mongodb')->collection($table)
            ->where(function($q) use ($cases, $query) {
                if ($query){
                    $firstCase = array_shift($cases);
                    $q->where($firstCase, 'like', '%'.$query.'%');
                    foreach($cases as $case) {
                        $q->orWhere($case, 'like', '%'.$query.'%');
                    }
                }
            });
        $result->where(function($q) use ($filters_arr, $query) {
                if ($filters_arr) {
                    foreach ($filters_arr as $filter) {
                        if ($filter->type === 'range')
                            $q->whereBetween($filter->name, [$filter->min, $filter->max]);
                        elseif ($filter->type === 'select' && $filter->value !== 'all')
                            $q->where($filter->name, $filter->value);
                    }
                }
            });
        $result->orderBy($sort_by, $sort_type);
        $data['result'] = $result->paginate(10);
        return $data;
    }

    public function selectedMols($request, $table)
    {
        $query = $request->get('query');
        $query = str_replace(" ", "%", $query);
        $filters_arr = json_decode($request->get('filters_arr'));

        $cases = $this->columns($table);

        $data = DB::connection('mongodb')->collection($table)
            ->where(function($q) use ($cases, $query) {
                if ($query){
                    $firstCase = array_shift($cases);
                    $q->where($firstCase, 'like', '%'.$query.'%');
                    foreach($cases as $case) {
                        $q->orWhere($case, 'like', '%'.$query.'%');
                    }
                }
            })
            ->where(function($q) use ($filters_arr, $query) {
            if ($filters_arr) {
                foreach ($filters_arr as $filter) {
                    if ($filter->type === 'range')
                        $q->whereBetween($filter->name, [$filter->min, $filter->max]);
                    elseif ($filter->type === 'select' && $filter->value !== 'all')
                        $q->where($filter->name, $filter->value);
                }
            }
        })->pluck('Mol_ID');
        return $data;

    }

    public function columns($table)
    {
        $keys = DB::connection('mongodb')->collection($table)->raw(function($collection)
        {
            $cursor = $collection->find();
            $array = iterator_to_array($cursor);
            $fields = array();
            foreach ($array as $k=>$v) {
                foreach ($v as $a=>$b) {
                    $fields[] = $a;
                }
            }
            return array_values(array_unique($fields));
        });
        return $keys;
    }

    public function computation($project, $run)
    {
        $node = Node::where('run', $run)->first();
        $computations = Computation::get();
        return view('pages.mol2grid.computation', compact('project', 'run', 'computations', 'node'));
    }

    public function executeComputation(Request $request)
    {
        $node = Node::where('id', $request->id)->first();

        $process = new Process(['python3', public_path('storage/uploads/computations/'.$node->computation->file), '--f', 'bhbhbhbhbh']);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $output_data = $process->getOutput();

        if (Node::where('id', $request->id)->update(["executed" => 1])){
            return response()->json([
                'alert' => 'success',
                'message' => 'Successfully Executed!'
            ]);
        }else{
            return response()->json([
                'alert' => 'error',
                'message' => 'Something went wrong please try again!'
            ]);
        }

    }

    public function filtered($array = [], $table)
    {
        $filtered = [];
        $filters = ["QED", "SA", "Energy", "Energy1", "Energy2", "Reward", "env_step", "episode", "num_valid_actions", "step_time"];

        foreach($array as $key => $value)
        {
            if (in_array($value, $filters)) {
                $filtered[] = [
                    "max" => number_format((float)DB::connection('mongodb')->collection($table)->max($value), 4, '.', ''),
                    "min" => number_format((float)DB::connection('mongodb')->collection($table)->min($value), 4, '.', ''),
                    "title" => ucfirst(str_replace('_', ' ', $value)),
                    "name" => $value,
                    "type" => 'range'
                ];
            }elseif ($value === 'action_type'){
                $data = DB::connection('mongodb')->collection($table)->get()->groupBy('action_type')->toArray();
                $filtered[] = [
                    "data" => array_keys($data),
                    "title" => ucfirst(str_replace('_', ' ', $value)),
                    "name" => $value,
                    "type" => 'dropdown'
                ];
            }
        }
        return $filtered;
    }

    public function proteinToPDB($project, $mol_id)
    {

        $protein_name = explode('-', $mol_id);

        $protein = public_path('/projects/'.$project.'/targets/P_'.$protein_name[0].'.mol2');

        if (File::exists($protein)){
            $protein_pdb = public_path('projects/'.$project.'/targets/P_'.$protein_name[0].'.pdb');

            if (!File::exists($protein_pdb)) {

                $process = new Process(['obabel', public_path('projects/' . $project . '/targets/P_' . $protein_name[0] . '.mol2'), '-O', public_path('projects/' . $project . '/targets/' . $protein_name[0] . '.pdb'), '-l 1 -d --partialcharge mmff94']);

                $process->run();

                if (!$process->isSuccessful()) {
                    throw new ProcessFailedException($process);
                }

                $output_data = $process->getOutput();

                $process1 = new Process(['obabel', public_path('projects/' . $project . '/targets/' . $protein_name[0] . '.pdb'), '-O', public_path('projects/' . $project . '/targets/P_' . $protein_name[0] . '.pdb'), '-h --partialcharge mmff94']);
                $process1->run();

                if (!$process1->isSuccessful()) {
                    throw new ProcessFailedException($process1);
                }

                $output = $process1->getOutput();
            }
        }
        return 'P_'.$protein_name[0].'.pdb';
    }

    public function molView($project, $table, $id)
    {
        $main_run = explode('_filtered_', $table);
        $data = DB::connection('mongodb')->collection($table)->where("_id", $id)->first();
        $molecules_arr = [];

        $protein = $this->proteinToPDB($project, $data['Mol_ID']);

        $sd = public_path('/projects/'.$project.'/runs/'.$main_run[0].'/ligands/'.$data['Mol_ID'].'_out.sd');

        if (File::exists($sd)) {
            $destinationPath = public_path('projects/' . $project . '/runs/' . $main_run[0] . '/ligands/' . $data['Mol_ID'] . '/');

            if (!is_dir($destinationPath)) {
                mkdir($destinationPath, 0775, true);

                $process = new Process(['obabel', $sd, '-O', $destinationPath . '/' . $data['Mol_ID'] . '_.pdb', '-m -d --partialcharge mmff94']);

                $process->run();

                if (!$process->isSuccessful()) {
                    throw new ProcessFailedException($process);
                }

                $output_data = $process->getOutput();

                $filesInFolder = \File::files($destinationPath);
                foreach ($filesInFolder as $key => $path) {
                    $file = pathinfo($path);

                    $process_final = new Process(['obabel', $file['basename'], '-O', $file['basename'], '-h --partialcharge mmff94']);

                    $process_final->run();

                    if (!$process_final->isSuccessful()) {
                        throw new ProcessFailedException($process_final);
                    }

                    $output_final = $process_final->getOutput();

                    $fp1 = fopen($destinationPath . $file['basename'], 'a+');
                    $file2 = file_get_contents(public_path('/projects/' . $project . '/targets/' . $protein));
                    fwrite($fp1, $file2);
                    $molecules_arr[$key] = ['path' => '/projects/' . $project . '/runs/' . $main_run[0] . '/ligands/' . $data['Mol_ID'] . '/' . $file['basename']];;
                }
            }else{
                $filesInFolder = \File::files($destinationPath);
                foreach ($filesInFolder as $key => $path) {
                    $file = pathinfo($path);
                    $molecules_arr[$key] = ['path' => '/projects/' . $project . '/runs/' . $main_run[0] . '/ligands/' . $data['Mol_ID'] . '/' . $file['basename']];;
                }
            }
        }
        return view('pages.mol2grid.view', compact('data', 'molecules_arr'));
    }

    public function view3d($name, Request $request)
    {
        $ids = explode(',', $request->ids);

        return view('pages.mol2grid.3d_view', compact('ids', 'name'));

    }

    public function note($name, Request $request)
    {
        if (DB::connection('mongodb')->collection($name)->where('_id', $request->mol_id)->update(['note' => $request->note])){
            return response()->json([
                'alert' => 'success',
                'message' => 'Successfully Updated!'
            ]);
        }else{
            return response()->json([
                'alert' => 'error',
                'message' => 'Something went wrong please try again!'
            ]);
        }
    }

    public function removeAll(Request $request, $project, $name)
    {
        if (Schema::connection('mongodb')->dropIfExists($name)){
            $request->session()->flash('success_message', 'Successfully Deleted!');
        }else{
            $request->session()->flash('message', 'Something went wrong please try again!');
        }

        return redirect()->route('projects.runs', $project);
    }

    public function exportCsv($name)
    {
        $analysis = DB::connection('mongodb')->collection($name)->get();
        if ($analysis){
            return response()->json([
                'alert' => 'success',
                'analysis' => $analysis,
            ]);
        }
    }

    public function exportCsvSelected(Request $request, $name)
    {
        if ($request->selected){
            $analysis = DB::connection('mongodb')->collection($name)->whereIn('Mol_ID', $request->selected)->get();
            if ($analysis){
                return response()->json([
                    'alert' => 'success',
                    'analysis' => $analysis,
                ]);
            }
        }

    }


    public function deleteSelected(Request $request, $name)
    {
        if ($request->selected){
            $selected = json_decode($request->selected, true);
            $analysis = DB::connection('mongodb')->collection($name)->whereIn('Mol_ID', $selected)->delete();
            if ($analysis){
                return response()->json([
                    'alert' => 'success',
                    'analysis' => $analysis,
                ]);
            }
        }
    }


    public function uploadSelected(Request $request, $name)
    {
        $request->name = $request->name.'_'.date("Y_m_d_H_i_s");

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'selected' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'alert' => 'error',
                'errors' => $validator->messages(),
            ]);
        }

        $analysis = DB::connection('mongodb')->collection($name)->whereIn('Mol_ID', $request->selected)->get()->toArray();

        DB::connection('mongodb')->collection($request->name)->insert($analysis);

        return response()->json([
            'alert' => 'success',
            'message' => 'Successfully Uploaded!'
        ]);
    }

    public function destroy(Request $request, $name)
    {
        if (DB::connection('mongodb')->collection($name)->where('_id', $request->id)->delete()){
            return response()->json([
                'alert' => 'success',
                'message' => 'Successfully Deleted!'
            ]);
        }else{
            return response()->json([
                'alert' => 'error',
                'message' => 'Something went wrong please try again!',
            ]);
        }
    }

    public function test()
    {

//        $path = public_path('../../../../../home/valtersahakyan/denovo/test');
//        $files = scandir($path);
//        rename('../../../../../home/valtersahakyan/denovo/test', '../../../../../home/valtersahakyan/denovo/test123');
//        dd($files);
//
//        $filesInFolder = \File::files('3Dmol');
//        foreach($filesInFolder as $path) {
//            $file = pathinfo($path);
//            echo '<pre>'.$file['filename'] ;
//        }
//
//        Schema::connection('mongodb')->dropIfExists('projects');
//        DB::connection('mongodb')->collection('analysis_tables')->where("name", $name)->delete();
//
//        $listCollections = [];
//
//        foreach (\DB::connection('mongodb')->getMongoDB()->listCollections() as $collection) {
//            $listCollections[]['name'] = $collection->getName();
//                    Schema::connection('mongodb')->dropIfExists($collection->getName());
//
//        }
//        dd($listCollections);
//        die();
//        dd(DB::connection('mongodb'));
//        DB::connection('mongodb')->collection('hastats')->insert(["id" => 4456]);
//        $log = DB::connection('mongodb')->collection('admin_2022_02_17_06_48_44')->paginate(10);
//
//        dd($log);
    }

}

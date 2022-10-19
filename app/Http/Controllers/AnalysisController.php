<?php

namespace App\Http\Controllers;

use App\Models\AnalysisTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnalysisController extends Controller
{

    public function index()
    {
        return view('pages.analysis.index');
    }



    public function loadCsvTxt(Request $request)
    {

        if ($request->hasFile('file')){
            $file = $request->file('file');
            if ($file->extension() && $file->getClientOriginalExtension() === "csv"){
                $column_name = [];
                $columns = [];
                $final_data = [];
                $smiles = 5;

                $file_data = file_get_contents($file->getRealPath());

                $data_array = array_map("str_getcsv", explode("\n", $file_data));

                $labels = array_shift($data_array);

                $filtered = ["QED", "SA", "Energy", "Reward", "env_step", "episode", "num_valid_actions", "step_time"];
                foreach($labels as $key => $value)
                {
                    $column_name[] = $value;
                    if (in_array($value, $filtered)) {
                        $columns[] = [
                            "data" => $value,
                            "title" => ucfirst(str_replace('_', ' ', $value)),
                            "key" => $key,
                            "type" => 'filter'
                        ];
                    }elseif ($value === 'action_type'){
                        $columns[] = [
                            "data" => $value,
                            "title" => ucfirst(str_replace('_', ' ', $value)),
                            "key" => $key,
                            "type" => 'dropdown'
                        ];
                    }elseif ($value === 'SMILES'){
                        $smiles = $key;
                        $columns[] = [
                            "data" => $value,
                            "title" => ucfirst(str_replace('_', ' ', $value)),
                            "key" => $key,
                        ];
                    } else{
                        $columns[] = [
                            "data" => $value,
                            "title" => ucfirst(str_replace('_', ' ', $value))
                        ];
                    }
                }

                $count = count($data_array) - 1;

                for($j = 0; $j < $count; $j++)
                {
                    $data = array_combine($column_name, $data_array[$j]);

                    $final_data[$j] = $data;
                }
                return [
                    "smiles" => $smiles,
                   "data" => $final_data,
                   "columns" => $columns,
                ];

            }
            if ($file->extension() && $file->getClientOriginalExtension() === "txt"){
                $columns = [];
                $smiles = 7;
                $file_data = file_get_contents($file->getRealPath());
                $data_array = json_decode($file_data, true);

                array_shift($data_array);
                array_pop($data_array);

                $filtered = ["QED", "SA", "Energy1", "Energy2", "Reward", "env_step", "episode", "num_valid_actions", "step_time"];

                foreach($data_array[0] as $key => $label)
                {
                    if (in_array($key, $filtered)) {
                        $columns[] = [
                            "data" => $key,
                            "title" => ucfirst(str_replace('_', ' ', $key)),
                            "key" => array_search($key, array_keys($data_array[0])),
                            "type" => 'filter'
                        ];
                    }elseif ($key === 'action_type'){
                        $columns[] = [
                            "data" => $key,
                            "title" => ucfirst(str_replace('_', ' ', $key)),
                            "key" => array_search($key, array_keys($data_array[0])),
                            "type" => 'dropdown'
                        ];
                    }elseif ($key === 'SMILES'){
                        $smiles = array_search($key, array_keys($data_array[0]));
                        $columns[] = [
                            "data" => $key,
                            "title" => ucfirst(str_replace('_', ' ', $key)),
                            "key" => array_search($key, array_keys($data_array[0])),
                        ];
                    } else{
                        $columns[] = [
                            "data" => $key,
                            "title" => ucfirst(str_replace('_', ' ', $key))
                        ];
                    }

                }
                return [
                    "smiles" => $smiles,
                    "data" => $data_array,
                    "columns" => $columns,
                ];

            }
        }

    }

    public function uploadDB(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:analysis_tables',
            'data' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'alert' => 'error',
                'errors' => $validator->messages(),
            ]);
        }

        try {

            AnalysisTable::create([
                "name" => $request->name,
                "columns" => json_encode($request->columns),
                "data" => json_encode($request->data),
                "smiles" => $request->smiles,
            ]);

            return response()->json([
                'alert' => 'success',
                'message' => 'Successfully Uploaded!'
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'alert' => 'error',
                'message' => 'Something went wrong please try again!',
            ]);
        }
    }

    public function dataTables(){
        $datatables = AnalysisTable::get();
        return [
            "datatables" => $datatables,
        ];
    }

    public function dataTableByName(Request $request){
        if ($request->name){
            $table = AnalysisTable::where('name', $request->name)->first();
            return response()->json([
                'response' => $table->data,
                'table' => $table,
                'alert' => 'success',
                'message' => 'Successfully Loaded!'
            ]);
        }else{
            return response()->json([
                'alert' => 'error',
                'message' => 'Something went wrong please try again!',
            ]);
        }
    }

}

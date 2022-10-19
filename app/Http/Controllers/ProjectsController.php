<?php

namespace App\Http\Controllers;

use App\Models\Node;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Yajra\DataTables\DataTables;


class ProjectsController extends Controller
{
    public $path;


    public function __construct()
    {
        $this->path = '/projects/';
    }

    function index()
    {
        $data = [];
        $path = public_path($this->path);
        $files = scandir($path);
        foreach ($files as $key => $value){
            if ($value != "." && $value != "..")
                if (!str_starts_with($value, '.'))
                    $data[$key] = ["id" => $key , "name" => $value];
        }

        return view('pages.projects.index', compact('data'));
    }

    public function pipeline($project, $run)
    {
        $nodes = Node::where('project', $project)->where('main_run', $run)->where('parent_id', null)->get();
        $count = DB::connection('mongodb')->collection($run)->count();

        return view('pages.projects.pipeline', compact('project', 'run', 'count', 'nodes'));
    }

    public function runs(Request $request, $project)
    {
        $data = [];

        if ($request->ajax()) {
            $path = public_path($this->path.$project.'/runs/');
            $files = scandir($path);
            foreach ($files as $key => $value){
                if ($value != "." && $value != "..")
                    if (!str_starts_with($value, '.'))
                        $data[$key] = ["id" => $key , "name" => $value];
            }

            return Datatables::of($data)
                ->rawColumns(['id', 'name', 'action'])
                ->addColumn('action', function($row) use ($project) {
                    $btn = '<a href="'.route('projects.pipeline', [$project, $row['name']]).'" class="btn btn-info btn-sm"><i class="bi bi-plus"></i>Add Node</a>';
                    return $btn;
                })
                ->rawColumns(['action'])
                ->make(true);
        }
        return view('pages.projects.runs', compact('project'));
    }

    public function create()
    {
        return view('pages.projects.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'general_info'  => 'required|string|max:500',
        ]);

        Project::create([
            'name' => $request->name,
            'general_info' => $request->general_info,
        ]);

        return redirect()->intended('/');
    }

    public function show()
    {
        return view('pages.projects.show');
    }

    public function edit(Project $project)
    {
        return view('pages.projects.edit', compact('project'));
    }

    public function update(Request $request, Project $project)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'general_info'  => 'required|string|max:500',
        ]);

        $project->update($request->all());

        return redirect()->intended('/')->with('success','Updated Successfully.');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->intended('/')->with('success','Deleted successfully.');
    }

    public function storeNode(Request $request)
    {
        $filters_arr = json_decode($request->filters);
        $main_run = explode('_filtered_', $request->run);
        $run = $main_run[0].'_filtered_'.date('d-m-Y-H-i-s');
        $filtered_data = DB::connection('mongodb')->collection($request->run)
            ->where(function($q) use ($filters_arr) {
                if ($filters_arr) {
                    foreach ($filters_arr as $filter) {
                        if ($filter->type === 'range')
                            $q->whereBetween($filter->name, [$filter->min, $filter->max]);
                        elseif ($filter->type === 'select' && $filter->value !== 'all')
                            $q->where($filter->name, $filter->value);
                    }
                }
            })
            ->get()->toArray();

        DB::connection('mongodb')->collection($run)->insert($filtered_data);

       $node = Node::create([
            'parent_id' => $request->parent_id ?? null,
            'type' => $request->type,
            'project' => $request->project,
            'main_run' => $main_run[0],
            'run' => $run,
            'filter_options' => $request->filters,
            'executed' => 1,
            'in' => $request->count,
            'out' => count($filtered_data)
        ]);

       if ($node){
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

    public function storeComputationNode(Request $request)
    {
        $main_run = explode('_filtered_', $request->run);
        $run = $main_run[0].'_filtered_'.date('d-m-Y-H-i-s');

        $node = Node::create([
            'parent_id' => $request->parent_id ?? null,
            'type' => $request->type,
            'project' => $request->project,
            'main_run' => $main_run[0],
            'run' => $run,
            'computation_id' => $request->computation_id,
        ]);

        if ($node){
            $request->session()->flash('success_message', 'Successfully Updated!');
        }else{
            $request->session()->flash('message', 'Something went wrong please try again!');
        }

        return redirect()->route('projects.pipeline', [$request->project, $main_run[0]]);

    }

    public function destroyNode(Request $request)
    {
        $node = Node::where('id', $request->id)->first();

        if ($node->childs()){
            foreach ($node->childs as $child){
                Schema::connection('mongodb')->dropIfExists($child->run);
                $child->delete();
            }
        }
        Schema::connection('mongodb')->dropIfExists($node->run);

        if ($node->delete()){
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
}

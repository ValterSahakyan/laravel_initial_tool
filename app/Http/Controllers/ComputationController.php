<?php

namespace App\Http\Controllers;

use App\Models\Computation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Yajra\DataTables\DataTables;

class ComputationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {

            $data = Computation::get();

            return Datatables::of($data)->addIndexColumn()
                ->addColumn('action', function($row){
                    $btn = '<a href="'.route('computations.edit', $row['id']).'" class="btn btn-light-info btn-sm"><i class="bi bi-pencil"></i></a> <a href="'.route('computations.destroy', $row['id']).'" class="btn btn-light-danger btn-sm remove-row"><i class="bi bi-trash"></i></a> ';
                    return $btn;
                })
                ->rawColumns(['action'])
                ->make(true);
        }
        return view('pages.computations.index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('pages.computations.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|min:2|max:60|unique:computations',
            'file' => 'required|max:2048',
        ]);

        if($request->file('file')){
            Storage::delete('/uploads/computations/'.$request->old_file);
            $file_path = $request->file('file');
            $file_name = time() . '-' .$file_path->getClientOriginalName();
            $request->file('file')->storeAs('public/uploads/computations', $file_name);
        }

        $computation = Computation::create([
            'name' => $request->name,
            'file' => $file_name ?? null
        ]);
        if ($computation){
            $request->session()->flash('success_message', 'Successfully created!');
        }else{
            $request->session()->flash('message', 'Something went wrong please try again!');
        }
        return redirect()->route('computations.index');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Computation  $computation
     * @return \Illuminate\Http\Response
     */
    public function show(Computation $computation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Computation  $computation
     * @return \Illuminate\Http\Response
     */
    public function edit(Computation $computation)
    {
        return view('pages.computations.edit', compact('computation'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Computation  $computation
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Computation $computation)
    {

        $request->validate([
            'name' => 'required|min:2|max:60|unique:computations,name,'.$computation->id,
            'file' => 'max:2048',
        ]);

        if($request->file('file')){
            $file_path = $request->file('file');
            $file_name = time() . '-' .$file_path->getClientOriginalName();
            $request->file('file')->storeAs('public/uploads/computations', $file_name);
        }

        $data = [
            'name' => $request->name,
            'file' => $file_name ?? $request->old_file,
        ];

        $computation->update($data);

        if ($computation){
            $request->session()->flash('success_message', 'Successfully Updated!');
        }else{
            $request->session()->flash('message', 'Something went wrong please try again!');
        }
        return redirect()->route('computations.index');

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Computation  $computation
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, Computation $computation)
    {
        Storage::delete('/uploads/computations/'.$computation->file);

        if ($computation->delete()){
            $request->session()->flash('success_message', 'Successfully Updated!');
        }else{
            $request->session()->flash('message', 'Something went wrong please try again!');
        }

        return redirect()->route('computations.index');
    }
}

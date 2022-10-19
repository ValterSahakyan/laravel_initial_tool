<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Yajra\DataTables\DataTables;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class AnalysisTableController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $data = [];
            foreach (\DB::connection('mongodb')->getMongoDB()->listCollections() as $collection) {
                $data[]['name'] = $collection->getName();
            }

            return Datatables::of(array_reverse($data))->addIndexColumn()
               ->addColumn('action', function($row){
                    $btn = '<a href="'.route('mol2grid.index', $row['name']).'" class="btn btn-light-info btn-sm"><i class="bi bi-eye"></i></a> <button data-id="'.$row["name"].'"  class="btn btn-light-danger btn-sm remove-row"><i class="bi bi-trash"></i></button> ';
                    return $btn;
                })
                ->rawColumns(['action'])
                ->make(true);
        }
        return view('pages.tables.index');

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy($name)
    {
        try {
            Schema::connection('mongodb')->dropIfExists($name);
            return response()->json([
                'alert' => 'success',
                'message' => 'Successfully Deleted!'
            ]);
        } catch (\Exception $error) {
            return response()->json([
                'alert' => 'error',
                'message' => 'Something went wrong please try again!',
            ]);
        }
    }
}

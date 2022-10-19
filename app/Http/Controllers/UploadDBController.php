<?php

namespace App\Http\Controllers;

use App\Models\AnalysisTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class UploadDBController extends Controller
{

    public function index()
    {
        return view('pages.upload_db.index');
    }

    public function uploadCsvTxt(Request $request)
    {
        $data = [];

//        $request->name = $request->name.'_'.date("Y_m_d_H_i_s");

        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:analysis_tables',
            'file' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'alert' => 'error',
                'errors' => $validator->messages(),
            ]);
        }


        if ($request->hasFile('file')){
            $file = $request->file('file');
            if ($file->extension() && $file->getClientOriginalExtension() === "csv"){
                $file_data = file_get_contents($file->getRealPath());
                $data = array_map("str_getcsv", explode("\n", $file_data));
                array_shift($data);
            }elseif ($file->extension() && $file->getClientOriginalExtension() === "txt"){
                $file_data = file_get_contents($file->getRealPath());
                $data_array = json_decode($file_data, true);
                array_shift($data_array);
                array_pop($data_array);
                $data = $data_array;
            }

            DB::connection('mongodb')->collection($request->name)->insert($data);

            return redirect()->route('tables.index')->with('success', 'Successfully Uploaded!');

        }

    }

}

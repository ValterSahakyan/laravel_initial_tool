<?php

use App\Http\Controllers\Account\SettingsController;
use App\Http\Controllers\Auth\SocialiteLoginController;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\AnalysisTableController;
use App\Http\Controllers\ComputationController;
use App\Http\Controllers\Mol2gridController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\UploadDBController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return redirect('index');
// });

Route::middleware('auth')->group(function () {

    Route::get('/', [ProjectsController::class, 'index'])->name('projects.index');

    // Account pages
    Route::prefix('project')->group(function () {
        Route::get('create', [ProjectsController::class, 'create'])->name('project.create');
        Route::get('edit/{project}', [ProjectsController::class, 'edit'])->name('projects.edit');
        Route::get('destroy/{project}', [ProjectsController::class, 'destroy'])->name('projects.destroy');
        Route::get('show/', [ProjectsController::class, 'show'])->name('projects.show');
        Route::get('runs/{project}', [ProjectsController::class, 'runs'])->name('projects.runs');
        Route::get('pipeline/{project}/{run}', [ProjectsController::class, 'pipeline'])->name('projects.pipeline');
        Route::put('store', [ProjectsController::class, 'store'])->name('project.store');
        Route::post('update/{project}', [ProjectsController::class, 'update'])->name('project.update');
        Route::post('store-node', [ProjectsController::class, 'storeNode'])->name('project.node');
        Route::post('destroy-node', [ProjectsController::class, 'destroyNode'])->name('project.destroy_node');
        Route::post('store-computation-node', [ProjectsController::class, 'storeComputationNode'])->name('project.computation_node');

        Route::get('/computation/{project}/{run}', [Mol2gridController::class, 'computation'])->name('project.computation');
        Route::post('/execute-computation', [Mol2gridController::class, 'executeComputation'])->name('project.execute_computation');

        Route::get('/fetch_data/{project}/{table}', [Mol2gridController::class, 'fetch_data'])->name('project.mol2grid.fetch_data');

        Route::post('/note/{table}', [Mol2gridController::class, 'note'])->name('project.mol2grid.note');
        Route::get('/remove-all/{project}/{table}', [Mol2gridController::class, 'removeAll'])->name('project.mol2grid_removeAll');
        Route::post('/destroy/{table}/', [Mol2gridController::class, 'destroy'])->name('project.mol2grid.destroy');
        Route::post('/download-all/{table}/', [Mol2gridController::class, 'exportCsv'])->name('project.mol2grid_exportCsv');
        Route::get('/3d_view/{project}/{table}', [Mol2gridController::class, 'view3d'])->name('project.mol2grid_3d_view');
        Route::post('/download-selected/{table}', [Mol2gridController::class, 'exportCsvSelected'])->name('project.mol2grid.exportCsvSelected');
        Route::post('/delete-selected/{table}', [Mol2gridController::class, 'deleteSelected'])->name('project.mol2grid.deleteSelected');
        Route::post('/upload-selected/{table}', [Mol2gridController::class, 'uploadSelected'])->name('project.mol2grid.uploadSelected');
        Route::get('/view/{project}/{table}/{id}', [Mol2gridController::class, 'molView'])->name('project.mol2grid_view');
        Route::get('/{project}/{run}', [Mol2gridController::class, 'index'])->name('project.mol2grid');

    });

    Route::get('/analysis', [AnalysisController::class, 'index'])->name('analysis.index');
    Route::get('/test', [AnalysisController::class, 'test'])->name('analysis.test');
    Route::post('/loadCsvTxt', [AnalysisController::class, 'loadCsvTxt'])->name('analysis.loadCsvTxt');
    Route::post('/upload-db', [AnalysisController::class, 'uploadDB'])->name('analysis.upload_db');
    Route::get('/data-tables', [AnalysisController::class, 'dataTables'])->name('datatables.upload_db');
    Route::post('/data-table-by-name', [AnalysisController::class, 'dataTableByName'])->name('datatable_by_name.upload_db');

    // Account pages
    Route::prefix('account')->group(function () {
        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::put('settings/email', [SettingsController::class, 'changeEmail'])->name('settings.changeEmail');
        Route::put('settings/password', [SettingsController::class, 'changePassword'])->name('settings.changePassword');
    });

    Route::prefix('upload-db')->group(function () {
        Route::get('/', [UploadDBController::class, 'index'])->name('upload_db.index');
        Route::post('/uploadCsvTxt', [UploadDBController::class, 'uploadCsvTxt'])->name('upload_db.uploadCsvTxt');

    });

    Route::prefix('computations')->group(function () {
        Route::get('/', [ComputationController::class, 'index'])->name('computations.index');
        Route::get('/create', [ComputationController::class, 'create'])->name('computations.create');
        Route::post('/store', [ComputationController::class, 'store'])->name('computations.store');
        Route::get('/edit/{computation}', [ComputationController::class, 'edit'])->name('computations.edit');
        Route::post('/update/{computation}', [ComputationController::class, 'update'])->name('computations.update');
        Route::get('/remove-computation/{computation}', [ComputationController::class, 'destroy'])->name('computations.destroy');
    });

    Route::get('/test', [Mol2gridController::class, 'test'])->name('mol2grid.test');

//
//    Route::prefix('mol2grid')->group(function () {
//        Route::get('/{name}', [Mol2gridController::class, 'index'])->name('mol2grid.index');
//        Route::get('/fetch_data/{name}/', [Mol2gridController::class, 'fetch_data'])->name('mol2grid.fetch_data');
//
//        Route::get('/view/{name}/{id}/', [Mol2gridController::class, 'molView'])->name('mol2grid.view');
//
//        Route::post('/note/{name}', [Mol2gridController::class, 'note'])->name('mol2grid.note');
//        Route::get('/remove-all/{name}', [Mol2gridController::class, 'removeAll'])->name('mol2grid.removeAll');
//        Route::get('/remove-all/{name}', [Mol2gridController::class, 'removeAll'])->name('mol2grid.removeAll');
//        Route::post('/destroy/{name}/', [Mol2gridController::class, 'destroy'])->name('mol2grid.destroy');
//        Route::get('/download-all/{name}', [Mol2gridController::class, 'exportCsv'])->name('mol2grid.exportCsv');
//        Route::get('/3d_view/{name}', [Mol2gridController::class, 'view3d'])->name('mol2grid.3d_view');
//        Route::post('/download-selected/{name}', [Mol2gridController::class, 'exportCsvSelected'])->name('mol2grid.exportCsvSelected');
//        Route::post('/delete-selected/{name}', [Mol2gridController::class, 'deleteSelected'])->name('mol2grid.deleteSelected');
//        Route::post('/upload-selected/{name}', [Mol2gridController::class, 'uploadSelected'])->name('mol2grid.uploadSelected');
//    });

    Route::get('tables', [AnalysisTableController::class, 'index'])->name('tables.index');
    Route::get('tables/{name}', [AnalysisTableController::class, 'show'])->name('tables.show');
    Route::post('tables/{name}', [AnalysisTableController::class, 'show'])->name('tables.show');
    Route::get('/remove-table/{name}', [AnalysisTableController::class, 'destroy'])->name('table.destroy');
});

Route::resource('users', UsersController::class);

/**
 * Socialite login using Google service
 * https://laravel.com/docs/8.x/socialite
 */
Route::get('/auth/redirect/{provider}', [SocialiteLoginController::class, 'redirect']);

require __DIR__.'/auth.php';

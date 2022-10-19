<x-base-layout>
    <div class="row gy-5 g-xl-8">
        <div class="post d-flex flex-column-fluid" id="kt_post">
            <!--begin::Container-->
            <div id="kt_content_container" class="container-xxl">
                <!--begin::Card-->
                <div class="card">
                    <!--begin::Card body-->
                    <div class="card-body">
                        <!--begin::Heading-->
                        <div class="card-px text-center pt-15 pb-15">
                            <!--begin::Title-->
                            <h2 class="fs-2x fw-bolder mb-0">Run Analysis</h2>
                            <!--end::Title-->
                            <!--begin::Description-->
                            <p class="text-gray-400 fs-4 fw-bold py-7">Choose an option from the menu below to
                                proceed</p>
                            <!--end::Description-->
                            <!--begin::Action-->
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                                    data-bs-target="#load_csv_txt">
                                Load a CSV or a TXT
                            </button>
                            <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#load_db">
                                Load from DB
                            </button>
                            <!--end::Action-->
                        </div>
                    </div>
                    <!--end::Card body-->
                </div>
                <!--end::Card-->

                <!-- Modal-->
                <div class="modal fade" tabindex="-1" id="load_csv_txt">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Load a CSV or a TXT</h5>

                                <!--begin::Close-->
                                <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal"
                                     aria-label="Close">
                                    <span class="svg-icon svg-icon-2x"></span>
                                </div>
                                <!--end::Close-->
                            </div>
                            <div class="modal-body">
                                <!--begin::Form-->
                                <form class="form" action="#" method="post">
                                @csrf
                                <!--begin::Input group-->
                                    <div class="fv-row">
                                        <!--begin::Dropzone-->
                                        <div class="dropzone" id="csv_txt">
                                            <!--begin::Message-->
                                            <div class="dz-message needsclick">
                                                <!--begin::Icon-->
                                                <i class="bi bi-file-earmark-arrow-up text-primary fs-3x"></i>
                                                <!--end::Icon-->
                                                <!--begin::Info-->
                                                <div class="ms-4">
                                                    <h3 class="fs-5 fw-bolder text-gray-900 mb-1">Drop files here or
                                                        click to upload.</h3>
                                                    <span class="fs-7 fw-bold text-gray-400">Limit 200MB per file • CSV, TXT</span>
                                                </div>
                                                <!--end::Info-->
                                            </div>
                                        </div>
                                        <!--end::Dropzone-->
                                    </div>
                                    <!--end::Input group-->
                                </form>
                                <!--end::Form-->
                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" id="uploadFile">Load</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!--begin::Modal-->
                <div class="modal fade" tabindex="-1" id="load_db">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Load from DB</h5>

                                <!--begin::Close-->
                                <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal"
                                     aria-label="Close">
                                    <span class="svg-icon svg-icon-2x"></span>
                                </div>
                                <!--end::Close-->
                            </div>

                            <div class="modal-body">
                                <div class="mb-10">
                                    <label for="" class="form-label">Select Table</label>
                                    <select class="form-select form-select-solid"
                                            data-control="select2"
                                            data-placeholder="Select an option"
                                            data-allow-clear="true">
                                        <option></option>
                                        <option value="1">Option 1</option>
                                        <option value="2" selected>Option 2</option>
                                        <option value="3">Option 3</option>
                                        <option value="4">Option 4</option>
                                        <option value="5">Option 5</option>
                                    </select>
                                </div>
                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary">Load</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::Modal-->
            </div>
            <!--end::Container-->
        </div>
        <div class="row gy-5 g-xl-8">
            <div class="card">
            <!--begin::Card body-->
            <div class="card-body">
                <div class="table-responsive border rounded">
                    <table id="kt_datatable_example_4" class="table table-striped table-row-bordered gy-5 gs-7">
                        <thead>
                        <tr>
                            <th>Mol_ID</th>
                            <th>QED</th>
                            <th>SA</th>
                            <th>Energy</th>
                            <th>Reward</th>
                            <th>SMILES</th>
                            <th>env_step</th>
                            <th>episode</th>
                            <th>num_valid_actions</th>
                            <th>action_type</th>
                            <th>step_time</th>
                        </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>
        </div>
    </div>
</x-base-layout>
{{-- Inject Scripts --}}
@section('scripts')
    {{ $dataTable->scripts() }}
@endsection

{{--<script src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.min.js"></script>--}}

{{--<script>--}}

{{--    $('#uploadFile').click(function () {--}}
{{--        myDropzone.processQueue();--}}
{{--    });--}}

{{--    var myDropzone = new Dropzone("#csv_txt", {--}}
{{--        url: "/loadCsvTxt",--}}
{{--        paramName: "file",--}}
{{--        maxFiles: 1,--}}
{{--        maxFilesize: 100,--}}
{{--        addRemoveLinks: true,--}}
{{--        autoProcessQueue: false,--}}
{{--        acceptedFiles: ".csv, .txt",--}}
{{--        method: 'post',--}}
{{--        headers: {--}}
{{--            'X-CSRF-Token': $('input[name="_token"]').val()--}}
{{--        },--}}
{{--        accept: function (file, done) {--}}
{{--            done();--}}
{{--        },--}}
{{--        success: function (file, response) {--}}
{{--            $('#load_csv_txt').modal('hide');--}}
{{--            console.log(response, 'rrrrrrrrr')--}}
{{--            $("#kt_datatable_example_4").DataTable({--}}
{{--                "scrollY": 300,--}}
{{--                "scrollX": true,--}}
{{--                data: response,--}}
{{--                columns: [--}}
{{--                    { "data": "Mol_ID" },--}}
{{--                    { "data": "QED" },--}}
{{--                    { "data": "SA" },--}}
{{--                    { "data": "Energy" },--}}
{{--                    { "data": "Reward" },--}}
{{--                    { "data": "SMILES" },--}}
{{--                    { "data": "env_step" },--}}
{{--                    { "data": "episode" },--}}
{{--                    { "data": "num_valid_actions" },--}}
{{--                    { "data": "action_type" },--}}
{{--                    { "data": "step_time" },--}}
{{--                ],--}}
{{--            });--}}

{{--        },--}}
{{--        error: function (file, response) {--}}
{{--            alert(response);--}}
{{--        }--}}
{{--    });--}}


{{--</script>--}}

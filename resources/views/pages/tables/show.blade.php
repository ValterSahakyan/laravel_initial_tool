<x-base-layout>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css">
    <script src="https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js"></script>

    <style>
        .toast-error{
            background-color: #F64E60 !important;
        }
        .toast-success{
            background-color: #1BC5BD !important;
        }
    </style>
    <!--begin::Card-->
    <div class="card">
        <!--begin::Card body-->
        <div class="card-body pt-6">
            <div class="datatable_filter d-flex flex-stack mb-5">

                <div class="d-flex align-items-center position-relative my-1">
                    <label class="form-check form-check-inline form-check-solid">
                        <input class="check_all form-check-input" name="check_all" type="checkbox" value="1"/>
                        <span class="fw-bold ps-2 fs-6">Select All</span>
                    </label>
                    <!--begin::Add customer-->
                    <button onclick="download_all()" class="btn btn-light-warning me-3 btn-sm" data-bs-toggle="tooltip">
                        <i class="bi bi-download fs-4 me-2"></i>
                        Download All
                    </button>
                    <div class="d-none selected_buttons">
                        <button id="download_selected"  onclick="download_selected()" class="btn btn-light-primary me-3 btn-sm" data-bs-toggle="tooltip">
                            <i class="bi bi-download fs-4 me-2"></i>
                            Download Selected
                        </button>

                        <button onclick="delete_selected()" id="delete_selected" class="btn btn-light-danger me-3 btn-sm" data-bs-toggle="tooltip">
                            <i class="bi bi-trash fs-4 me-2"></i>
                            Delete Selected
                        </button>

                        <button id="upload_selected_db" type="button" id="upload_selected" class="btn btn-light-success me-3 btn-sm">
                            <i class="bi bi-upload fs-4 me-2"></i>
                            Upload Selected to DB
                        </button>
                    </div>
                    <button type="button" class="btn btn-icon-info btn-light-info me-3 btn-sm" id="refresh">
                        <i class="bi bi-arrow-repeat fs-4"></i>
                    </button>
                </div>

                <!--begin::Toolbar-->
                <div class="d-flex justify-content-end" data-kt-docs-table-toolbar="base">
                    <button type="button" id="filter_option" class="btn btn-light-primary me-3 show menu-dropdown" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                        <i class="fas fa-filter fs-4 me-2"></i>
                        Filter
                    </button>
                    <div class="menu menu-sub menu-sub-dropdown w-400px w-md-500px" data-kt-menu="true" id="filter_option">
                        <div class="px-7 py-5">
                            <div class="fs-5 text-dark fw-bolder">Filter Options</div>
                        </div>
                        <div class="separator border-gray-200"></div>
                        <div class="px-7 py-5 range_sliders h-600px overflow-auto">

                        </div>
                        <div class="px-7 py-5">
                            <div class="d-flex justify-content-end">
                                <button type="reset" class="btn btn-sm btn-light btn-active-light-primary me-2" id="reset_range">Reset</button>
                                <button type="submit" class="btn btn-sm btn-primary" data-kt-menu-dismiss="true">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <table class="table table-row-bordered analysis_datatable">
                <thead>
                <tr>
                    @foreach($columns as $column)
                    <th>
                        {{$column['name']}}
                    </th>
                    @endforeach
                </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <!--end::Card body-->
    </div>
    <!--end::Card-->
</x-base-layout>
<script type="text/javascript" src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/1.10.20/js/dataTables.bootstrap4.min.js"></script>

<script type="text/javascript">
    var columns = @json($columns);

        var table = $('.analysis_datatable').DataTable({
            processing: true,
            serverSide: true,
            paging: true,
            scrollX: true,
            ajax: {
                url: "{{ route('tables.show', $name) }}",
                type: 'post',
                headers: {
                    'X-CSRF-TOKEN': jQuery('meta[name="csrf-token"]').attr('content')
                },
            },
            columns: columns,
        });

        $('.check_all').click(function(event) {
            var checked = this.checked;
            table.column(0).nodes().to$().each(function(index) {
                if (checked) {
                    $(this).find('.row-check').prop('checked', 'checked');
                } else {
                    $(this).find('.row-check').prop('checked', '');
                }
            });
        });

</script>

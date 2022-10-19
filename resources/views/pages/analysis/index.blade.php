<x-base-layout>

    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.1/css/ion.rangeSlider.min.css"/>
    <script src="https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js"></script>
    <style>
        #kt_content_container{
         max-width: 1600px;
        }
        .toast-error{
            background-color: #F64E60 !important;
        }
        .toast-success{
            background-color: #1BC5BD !important;
        }
        .fixed_smiles{
            width: 200px;
        }
        .note_form{
            position: absolute;
        }
    </style>
    <div class="row gy-5 g-xl-12">
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
                            <p class="text-gray-400 fs-4 fw-bold py-7">Choose an option from the menu below to proceed</p>
                            <!--end::Description-->
                            <!--begin::Action-->
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#load_csv_txt">
                                Load a CSV or a TXT
                            </button>
                            <button type="button" class="btn btn-info" id="load_from_db">
                                Load from DB
                            </button>
                            <!--end::Action-->
                        </div>

                        <!--begin::Wrapper-->
                        <div class="datatable_filter d-none d-flex flex-stack mb-5">

                            <div class="d-flex align-items-center position-relative my-1">
                                <label class="form-check form-check-inline form-check-solid">
                                    <input class="check_all form-check-input" name="check_all" type="checkbox" value="1"/>
                                    <span class="fw-bold ps-2 fs-6">Select All</span>
                                    </label>
                                <button type="button" class="btn btn-light-success me-3 btn-sm" data-bs-toggle="modal" data-bs-target="#upload_db">
                                    <i class="bi bi-upload fs-4 me-2"></i>
                                    Upload to DB
                                </button>

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
                        <div id="datatable_section">
                            <table id="csv_txt_datatable" class="table table-row-bordered"></table>
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
                                                    <h3 class="fs-5 fw-bolder text-gray-900 mb-1">Drop files here or click to upload.</h3>
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
                                <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">
                                    <span class="svg-icon svg-icon-2x"></span>
                                </div>
                                <!--end::Close-->
                            </div>
                            <form id="load_data_by_table_name">
                                <div class="modal-body">
                                    <div class="mb-10">
                                        <label for="" class="form-label">Select Table</label>
                                        <div>
                                            <select id="tables" class="form-select form-select-solid" data-kt-select2="true" data-placeholder="Select option"
                                                    data-dropdown-parent="#load_db" data-allow-clear="true">
                                                <option></option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="modal-footer">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                    <button type="submit" class="btn btn-primary">Load</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <!--end::Modal-->

                <!--begin::Modal-->
                <div class="modal fade" tabindex="-1" id="upload_db">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Upload to DB</h5>

                                <!--begin::Close-->
                                <div class="btn btn-icon btn-sm btn-active-light-primary ms-2" data-bs-dismiss="modal"
                                     aria-label="Close">
                                    <span class="svg-icon svg-icon-2x"></span>
                                </div>
                                <!--end::Close-->
                            </div>
                            <div class="row">
                                <div class="col-12 text-center mb-2 spinner d-none">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                            <form id="upload_form">
                                <div class="modal-body">
                                    <div class="mb-10">
                                        <label for="name" class="required form-label">Table name</label>
                                        <input type="text" name="name" id="table_name" class="form-control form-control-solid" placeholder="Table name"/>
                                        <span class="invalid-feedback table_name_invalid" role="alert"></span>
                                    </div>
                                </div>

                                <div class="modal-footer">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                    <button type="submit" class="btn btn-primary">Upload</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <!--end::Modal-->
            </div>
            <!--end::Container-->
        </div>
    </div>
</x-base-layout>

<script type="text/javascript" src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/1.10.20/js/dataTables.bootstrap4.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.1/js/ion.rangeSlider.min.js"></script>
<script>

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': jQuery('meta[name="csrf-token"]').attr('content')
        }
    });

    var dropdown_col;
    var checked_rows = [];
    var columns;
    var response_data;
    var response_smiles;
    var filtered_data = [];
    var upload_type = 'all';

    $('#refresh').click(function () {
        location.reload();
    });

    $('#uploadFile').click(function () {
        myDropzone.processQueue();
    });

    $('#reset_range').click(function () {
        var sliders = $(".range_sliders").find(".js-range-slider");
        $(sliders).each(function(index,slider){
            var slider_instance = $(slider).data("ionRangeSlider");
            slider_instance.reset();
        });
        $('#action_type').val('');
        $('#csv_txt_datatable').DataTable().column(dropdown_col).search($(this).val()).draw();

        $('#csv_txt_datatable').DataTable().draw()
    });

    $('#upload_selected_db').click(function (){
        $('#upload_db').modal('show');
        upload_type = 'selected';
    })

    $('#load_from_db').click(function (){
        $.ajax({
            type: "get",
            url: "/data-tables",
            dataType:'json',
            success: function (data) {
                $.each(data.datatables, function( key, value ) {
                    $("#tables").append('<option value="'+value.name+'">'+value.name+'</option>')
                })
            }
        });
        $('#load_db').modal('show');
        upload_type = 'selected';
    })

    $("#load_data_by_table_name").submit(function (event) {
        event.preventDefault();
        var name = $("#tables").val();
        $.ajax({
            type: "post",
            url: "/data-table-by-name",
            data: {name:name},
            dataType:'json',
            success: function (data) {
                if(data.response){
                    columns = JSON.parse(data.table.columns)
                    response_smiles = data.table.smiles
                    response_data = JSON.parse(data.response)

                    $('#load_db').modal('hide');
                    $(".datatable_filter").removeClass('d-none')

                    if ($.fn.DataTable.isDataTable('#csv_txt_datatable') ) {
                        $('#csv_txt_datatable').remove();
                        $('#datatable_section').empty();
                        $(".range_sliders").empty();
                        $("#datatable_section").append('<table id="csv_txt_datatable" class="table table-row-bordered"></table>');
                    }

                    datatable(JSON.parse(data.response), JSON.parse(data.table.columns), data.table.smiles)
                    toastr.success(data.message, 'Success');
                }
            },
            error: function (data) {
                toastr.error('Something went wrong please try again!', 'Error');
            }
        });

    });

    $("#upload_form").submit(function (event) {
        $(".spinner").removeClass('d-none')
        event.preventDefault();
        var name = $("#table_name").val();
        var data = response_data;
        if (upload_type === 'selected'){
            data = checked_rows
        }

        $.ajax({
            type: "post",
            url: "/upload-db",
            data: {name:name, data:data, columns:columns, smiles:response_smiles},
            dataType:'json',
            success: function (data) {
                if (data.alert === 'success'){
                    $(".spinner").addClass('d-none')
                    $('#upload_db').modal('hide');
                    $("#table_name").val('')
                    toastr.success(data.message, 'Success');
                }else{
                    $("#table_name").addClass('is-invalid')
                    $(".table_name_invalid").html('<strong>'+data.errors['name']+'</strong>')
                }
            },
            error: function (data) {
                toastr.error('Something went wrong please try again!', 'Error');
            }
        });

    });


    function exportCSVFile(items, fileTitle) {
        $('#download-csv').remove();
        let csv = '';

        for(let row = 0; row < items.length; row++){
            let keysAmount = Object.keys(items[row]).length
            let keysCounter = 0
            if(row === 0){
                for(let key in items[row]){
                    csv += key + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                    keysCounter++
                }
                keysCounter = 0
                for(let key in items[row]){
                    csv += items[row][key] + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                    keysCounter++
                }
            }else{
                for(let key in items[row]){
                    csv += items[row][key] + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                    keysCounter++
                }
            }

            keysCounter = 0
        }

        let link = document.createElement('a')
        link.id = 'download-csv'
        link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
        link.setAttribute('download', fileTitle+'_'+new Date().getTime()+'.csv');
        document.body.appendChild(link)
        document.querySelector('#download-csv').click()
    }



    function download_selected() {
        exportCSVFile(checked_rows, 'analysis_checked');
    }

    function download_all() {
        exportCSVFile(filtered_data.length ? filtered_data : response_data, 'analysis_all');
    }

    $(document).on('change', '.row-check', function(){
        let value = $(this).data('row');
        const index = checked_rows.findIndex(object => object.Mol_ID === value.Mol_ID);
        if(this.checked) {
            if (index === -1) {
                checked_rows.push(value);
            }
        }else{
            if (index > -1) {
                checked_rows.splice(index, 1)
            }
        }
        if(checked_rows.length){
            $(".selected_buttons").removeClass('d-none')
        }else{
            $(".selected_buttons").addClass('d-none')
        }
    });

    var myDropzone = new Dropzone("#csv_txt", {
        url: "/loadCsvTxt",
        paramName: "file",
        maxFiles: 1,
        maxFilesize: 100,
        addRemoveLinks: true,
        autoProcessQueue: false,
        acceptedFiles: ".csv, .txt",
        method: 'post',
        headers: {
            'X-CSRF-Token': $('input[name="_token"]').val()
        },
        accept: function (file, done) {
            done();
        },
        success: function (file, response) {
            columns = response.columns
            response_smiles = response.smiles
            response_data = response.data

            if ($.fn.DataTable.isDataTable('#csv_txt_datatable') ) {
                $('#csv_txt_datatable').remove();
                $('#datatable_section').empty();
                $(".range_sliders").empty();
                $("#datatable_section").append('<table id="csv_txt_datatable" class="table table-row-bordered"></table>');
            }

            $('#load_csv_txt').modal('hide');
            $(".datatable_filter").removeClass('d-none')
            datatable(response.data, response.columns, response.smiles)
        },
        error: function (file, response) {
            alert(response);
        }
    });

    function datatable(data, columns, smiles){

        for (const column in columns) {
            if(columns[column].type === 'filter'){
                let min = Math.min.apply(null, data.map(function(a){
                    return a[columns[column].data];
                }))

                let max = Math.max.apply(null, data.map(function(a){
                    return a[columns[column].data];
                }))

                $(".range_sliders").append('<div class="mb-10">' +
                    '<label class="form-label fw-bold">'+columns[column].title+'</label>' +
                    '<input type="text" data-col='+columns[column].key+' data-min=' + min + ' data-max=' + max + ' class="js-range-slider" name="'+columns[column].data+'" value="" /> ' +
                    '</div>');

                $(".js-range-slider").ionRangeSlider({
                    type: "double",
                    step: 0.01,
                    onChange: function (iondata){
                        $.fn.dataTable.ext.search.push(
                            function( settings, data, dataIndex ) {
                                var min = parseFloat(iondata.from);
                                var max = parseFloat(iondata.to);
                                var col = parseFloat(data[iondata.input.data('col')]);
                                if ( ( isNaN( min ) && isNaN( max ) ) ||
                                    ( isNaN( min ) && col <= max ) ||
                                    ( min <= col   && isNaN( max ) ) ||
                                    ( min <= col   && col <= max ) )
                                {
                                    return true;
                                }
                                return false;
                            }
                        );
                    },
                    onFinish: function (data) {
                        $('#csv_txt_datatable').DataTable().draw()
                        filtered_data = $('#csv_txt_datatable').DataTable().rows( { search: 'applied' } ).data()
                    },
                });
            }else if(columns[column].type === 'dropdown'){
                dropdown_col = columns[column].key
                let group = data.reduce((r, a) => {
                    r[a.action_type] = [...r[a.action_type] || [], a];
                    return r;
                }, {});
                $(".range_sliders").append('<div class="mb-10">' +
                    '<label class="form-label fw-bold">'+columns[column].title+'</label>' +
                    '<select id="action_type" class="form-select form-select-solid" data-kt-select2="true" data-placeholder="Select option" data-allow-clear="true">' +
                    '<option>all</option>' +
                    '</select>' +
                    '</div>');

                for (const key in group) {
                    $("#action_type").append('<option value="'+key+'">'+key+'</option>');
                }

                $("#action_type").on('change', function() {
                    $('#csv_txt_datatable').DataTable().column(columns[column].key).search($(this).val()).draw();
                });
            }
        }


        $('#csv_txt_datatable').DataTable( {
            columns: columns,
            data:data,
            scrollY: 800,
            pageLength: 100,
            paging:true,
            columnDefs: [
                {
                    targets: 0,
                    render: function(data, type, row, meta) {
                        return '<label class="form-check form-check-inline form-check-solid">' +
                            '<input class="row-check form-check-input" data-row=\''+JSON.stringify(row)+'\' data-id="'+meta.row+'" name="'+meta.row+'" type="checkbox" value="1"/> ' +
                            '<span class="fw-bold ps-2 fs-6">'+data+'</span>' +
                            '</label>' +
                            '<button type="button" class="btn btn-light-primary btn-sm" data-bs-toggle="collapse" href="#collapse_'+meta.row+'" role="button" aria-expanded="false" aria-controls="collapse_'+meta.row+'">' +
                            '<i class="bi bi-chat"></i>' +
                            'Note' +
                            '</button>' +
                            '<div class="collapse" id="collapse_'+meta.row+'">' +
                            '<form class="note_form">' +
                            '<div class="card">'+
                            '<textarea class="form-control" aria-label="With textarea"></textarea>' +
                            '<button type="button" class="btn btn-light-success btn-sm">Submit</button>' +
                            '</div>' +
                            '</form>' +
                            '</div>';
                    }
                },{
                    targets: smiles,
                    render: function(data, type, row, meta) {
                        var smilesDrawer = new SmilesDrawer.Drawer({width: 200, height: 150});
                        SmilesDrawer.parse(data, function (tree) {
                            smilesDrawer.draw(tree, 'smiles_'+meta.row, 'light', false);
                        });
                        return '<canvas data-smiles="'+data+'" id="smiles_'+meta.row+'"></canvas><p class="fixed_smiles">'+data+'</p>';
                    }
                }],
        } );
    }


    $('.check_all').on('click', function(e){
        if(this.checked){
            checked_rows=response_data;
            $('.row-check').prop('checked', 'checked');
        } else {
            checked_rows=[];
            $('.row-check').prop('checked', false);
        }
        console.log(checked_rows, 'checked_rows')
    });

    function delete_selected(){
        var new_data;

        if(filtered_data.length){
            new_data = filtered_data.filter(function(objFromA) {
                return !checked_rows.find(function(objFromB) {
                    return objFromA.Mol_ID === objFromB.Mol_ID
                })
            })
        }else{
            new_data = response_data.filter(function(objFromA) {
                return !checked_rows.find(function(objFromB) {
                    return objFromA.Mol_ID === objFromB.Mol_ID
                })
            })
        }

        filtered_data = new_data;
        checked_rows = [];
        $('#csv_txt_datatable').remove();
        $('#datatable_section').empty();
        $("#datatable_section").append('<table id="csv_txt_datatable" class="table table-row-bordered"></table>');
        datatable(filtered_data, columns, response_smiles)
    }

</script>

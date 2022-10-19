<x-base-layout>
    <script src="https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.1/css/ion.rangeSlider.min.css"/>
    <style>
        .columns_th{
            cursor: pointer;
        }
    </style>
    <div class="col-12">
        <a href="/project/pipeline/{{$data['project']}}/{{explode('_filtered_', $data['table'])[0]}}" class="btn"> <i class="fas fa-arrow-left"></i> Back</a>
        <button type="button" id="save_filter_node" class="filter_option btn btn-info btn-sm d-none fa-pull-right">
            <i class="bi bi-upload"></i>
            Save Filtering Node
        </button>
    </div>

    <!--begin::Card-->
    <div class="card">
        <button class="btn btn-primary global_loading d-none" type="button" disabled>
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
        </button>
        <!--begin::Card body-->
        <div class="card-body pt-6">
            <div class="row">
                <div class="col-12">
                    <div class="datatable_filter d-flex flex-stack mb-5">
                        <div class="d-flex align-items-center position-relative my-1">
                            <label class="form-check form-check-inline form-check-solid">
                                <input class="check_all form-check-input" name="check_all" type="checkbox" value="1"/>
                                <span class="fw-bold ps-2 fs-6">Select All</span>
                            </label>
                            <a href="{{route('project.mol2grid_removeAll',[$data['project'], $data['table']])}}" class="btn btn-light-danger me-3 btn-sm">
                                <i class="bi bi-trash fs-4 me-2"></i>
                                Delete All
                            </a>
                            <!--begin::Add customer-->
                            <a data-href="/project/download-all/{{$data['table']}}"  onclick="exportAll(event.target);" class="btn btn-light-warning me-3 btn-sm" data-bs-toggle="tooltip">
                                <i class="bi bi-download fs-4 me-2"></i>
                                Download All
                            </a>
                            <div class="d-none selected_buttons">
                                <a data-href="/mol2grid/download-selected/{{$data['table']}}"  onclick="exportSelected(event.target);" id="download_selected" class="btn btn-light-primary me-3 btn-sm" data-bs-toggle="tooltip">
                                    <i class="bi bi-download fs-4 me-2"></i>
                                    Download
                                </a>

                                <button onclick="delete_selected()" id="delete_selected" class="btn btn-light-danger me-3 btn-sm" data-bs-toggle="tooltip">
                                    <i class="bi bi-trash fs-4 me-2"></i>
                                    Delete
                                </button>

                                <button id="upload_selected_db" type="button" class="btn btn-light-success me-3 btn-sm">
                                    <i class="bi bi-upload fs-4 me-2"></i>
                                    Upload to DB
                                </button>

                                <a href="{{route('project.mol2grid_3d_view', [$data['project'], $data['table']])}}" id="3d_view" type="button" class="btn btn-light-success me-3 btn-sm">
                                    <i class="bi bi-badge-3d fs-4 me-2"></i>
                                    3D View
                                </a>

                            </div>
                        </div>

                        <!--begin::Toolbar-->
                        <div class="d-flex justify-content-end" data-kt-docs-table-toolbar="base">
                            <button type="button" id="filter_option" class="btn btn-light-primary me-3 show menu-dropdown" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                                <i class="fas fa-filter fs-4 me-2"></i>
                                Filter
                            </button>
                            <button type="button" id="filter_option_trash" class="filter_option btn btn-warning btn-sm d-none">
                                <i class="bi bi-x-circle-fill"></i>Clear
                            </button>
                            <div class="menu menu-sub menu-sub-dropdown w-500px w-md-600px" data-kt-menu="true" id="filter_option">
                                <div class="px-7 py-5">
                                    <div class="fs-5 text-dark fw-bolder">Filter Options</div>
                                </div>
                                <div class="separator border-gray-200"></div>
                                <div class="px-7 py-5 range_sliders h-600px overflow-auto">
                                    @foreach($data['filtered'] as $filter)
                                        @if($filter['type'] === 'range')
                                            <div class="mb-12">
                                                <label class="form-label fw-bold">{{$filter['title']}}</label>
                                                <input type="text" data-min="{{$filter['min']}}" data-max="{{$filter['max']}}" class="js-range-slider" id="range_{{$filter['name']}}" name="{{$filter['name']}}" value="" />
                                                <button type="button" class="btn btn-primary btn-sm mt-4" data-bs-toggle="collapse" href="#filter_{{$filter['name']}}" role="button" aria-expanded="false" aria-controls="filter_{{$filter['name']}}">
                                                    <i class="bi bi-arrow-left-right"></i>
                                                </button>
                                                <div class="row mt-4 collapse" id="filter_{{$filter['name']}}">
                                                    <div class="col-6">
                                                        <div class="input-group input-group-sm mb-3">
                                                            <div class="input-group-prepend">
                                                                <span class="input-group-text" id="inputGroup-sizing-sm">Min</span>
                                                            </div>
                                                            <input type="number" step="0.01" class="form-control js-range-input" id="{{$filter['name']}}_min" name="{{$filter['name']}}_min" value="{{$filter['min']}}" data-id="{{$filter['name']}}" data-original-value="{{$filter['min']}}"/>
                                                        </div>
                                                    </div>
                                                    <div class="col-6">
                                                        <div class="input-group mb-3">
                                                            <div class="input-group-prepend">
                                                                <span class="input-group-text">Max</span>
                                                            </div>
                                                            <input type="number" step="0.01" class="form-control js-range-input" id="{{$filter['name']}}_max" name="{{$filter['name']}}_max" value="{{$filter['max']}}" data-id="{{$filter['name']}}" data-original-value="{{$filter['max']}}"/>
                                                            <div class="input-group-append">
                                                                <button type="submit" class="btn btn-primary mt-1 btn-sm p-3 filter_input" data-id="{{$filter['name']}}">
                                                                    <i class="bi bi-arrow-right-circle-fill"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr>
                                        @elseif($filter['type'] === 'dropdown')
                                            <div class="mb-12">
                                                <label class="form-label fw-bold">{{$filter['title']}}</label>
                                                <select id="{{$filter['name']}}" name="{{$filter['name']}}" class="select-filter form-select form-select-solid" data-placeholder="Select option" data-allow-clear="true">
                                                    <option value="all">all</option>
                                                    @foreach($filter['data'] as $value)
                                                        <option value="{{$value}}">{{ucfirst(str_replace('_', ' ', $value))}}</option>
                                                    @endforeach
                                                </select>
                                            </div>
                                        @endif
                                    @endforeach
                                </div>
                                <div class="px-7 py-5">
                                    <div class="d-flex justify-content-end">
                                        <button type="reset" class="btn btn-sm btn-light btn-active-light-primary me-2" id="reset_filters">Reset</button>
                                        <button type="submit" class="btn btn-sm btn-primary" data-kt-menu-dismiss="true">Apply</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-5 la-pull-right">
                        <div class="form-group">
                            <input type="text" name="serach" id="serach" class="form-control" />
                        </div>
                    </div>
                </div>
            </div>
            <div id="table_data">
                <div class="table-responsive">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                @foreach($data['columns'] as $column)
                                    @if($column === 'note')
                                        <th>
                                            {{$column}}
                                        </th>
                                    @else
                                        <th class="sorting columns_th" data-sorting_type="asc" data-column_name="{{$column}}">
                                            {{$column}}  <span id="{{$column}}_icon"></span>
                                        </th>
                                    @endif
                                @endforeach
                            </tr>
                        </thead>
                        <tbody>
                            @include('pages.mol2grid.pagination_data')
                        </tbody>
                    </table>
                    <input type="hidden" name="hidden_page" id="hidden_page" value="1" />
                    <input type="hidden" name="hidden_column_name" id="hidden_column_name" value="id" />
                    <input type="hidden" name="hidden_sort_type" id="hidden_sort_type" value="asc" />
                    <input type="hidden" name="filters" id="filters" value="" />
                    <input type="hidden" name="check_all" id="check_all" value="" />
                    <input type="hidden" name="count" id="count" value="{{$data['result']->total()}}" />

                </div>
            </div>

        </div>
        <!--end::Card body-->
        <button class="btn btn-primary global_loading d-none" type="button" disabled>
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Loading...
        </button>
    </div>

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
    <!--end::Card-->
</x-base-layout>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.1/js/ion.rangeSlider.min.js"></script>

<script>
    var selected = [];

        $( document ).ready(function() {
            var filters_arr = localStorage.getItem("filters");
            if (filters_arr !== null){
                $(".filter_option").removeClass('d-none')
                JSON.parse(filters_arr)?.map(function(val, i ) {
                    if(val.type !== "select"){
                        var range_instance = $('#range_'+val.name).data("ionRangeSlider");
                        range_instance.update({
                            from: val.min,
                            to: val.max
                        });
                        $('#'+val.name+"_min").val(val.min)
                        $('#'+val.name+"_max").val(val.max)
                    }
                });
                var query = $('#serach').val();
                var column_name = $('#hidden_column_name').val();
                var sort_type = $('#hidden_sort_type').val();
                var page = $('#hidden_page').val();
                var check_all = $('#check_all').val();
                fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
            }
        });

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': jQuery('meta[name="csrf-token"]').attr('content')
            }
        });

        function exportAll() {
            $(".global_loading").removeClass('d-none');
            $.ajax({
                type: "POST",
                url: "{{route('project.mol2grid_exportCsv', $data['table'])}}",
                dataType: "json",
                encode: true,
                success:function(data)
                {
                    if(data.alert === 'success'){
                        exportCSVFile(data.analysis, 'analysis_selected');
                        toastr.success(data.message, 'Success');
                        $(".global_loading").addClass('d-none');
                    } else{
                        toastr.error(data.message, 'Error');
                    }
                }
            });
        }

        function exportSelected(){
            $(".global_loading").removeClass('d-none');
            $.ajax({
                type: "POST",
                url: "{{route('project.mol2grid.exportCsvSelected', $data['table'])}}",
                data: {selected: JSON.parse($('#checked_rows').val())},
                dataType: "json",
                encode: true,
                success:function(data)
                {
                    if(data.alert === 'success'){
                        exportCSVFile(data.analysis, 'analysis_selected');
                        toastr.success(data.message, 'Success');
                        $(".global_loading").addClass('d-none');
                    } else{
                        toastr.error(data.message, 'Error');
                    }
                }
            });
        }

        function clear_icon()
        {
            $('#id_icon').html('');
            $('#post_title_icon').html('');
        }

        function fetch_data(page, sort_type, sort_by, query, filters_arr, check_all)
        {
            $(".global_loading").removeClass('d-none');

            $.ajax({
                url:"/project/fetch_data/"+'{{$data['project']}}'+'/'+'{{$data['table']}}'+"?page="+page+"&sortby="+sort_by+"&sorttype="+sort_type+"&query="+query+"&filters_arr="+filters_arr+"&check_all="+check_all,
                success:function(data)
                {
                    $('tbody').html('');
                    $('tbody').html(data);
                    $(".global_loading").addClass('d-none');
                }
            })
        }

        $(document).on('keyup', '#serach', function(){
            var query = $('#serach').val();
            var column_name = $('#hidden_column_name').val();
            var sort_type = $('#hidden_sort_type').val();
            var filters_arr = localStorage.getItem("filters");
            var page = 1;
            var check_all = $('#check_all').val();
            fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
        });

        $(document).on('click', '.sorting', function(){
            var column_name = $(this).data('column_name');
            var order_type = $(this).data('sorting_type');
            var filters_arr = localStorage.getItem("filters");
            var reverse_order = '';
            if(order_type == 'asc')
            {
                $(this).data('sorting_type', 'desc');
                reverse_order = 'desc';
                clear_icon();
                $('#'+column_name+'_icon').html('<i class="bi bi-arrow-down-short"></i>');
            }
            if(order_type == 'desc')
            {
                $(this).data('sorting_type', 'asc');
                reverse_order = 'asc';
                clear_icon()
                $('#'+column_name+'_icon').html('<i class="bi bi-arrow-up-short"></i>');
            }
            $('#hidden_column_name').val(column_name);
            $('#hidden_sort_type').val(reverse_order);
            var page = $('#hidden_page').val();
            var query = $('#serach').val();
            var check_all = $('#check_all').val();
            fetch_data(page, reverse_order, column_name, query, filters_arr, check_all);
        });

        $(document).on('click', '.pagination a', function(event){
            event.preventDefault();
            var page = $(this).attr('href').split('page=')[1];
            $('#hidden_page').val(page);
            var column_name = $('#hidden_column_name').val();
            var sort_type = $('#hidden_sort_type').val();
            var filters_arr = localStorage.getItem("filters");
            var query = $('#serach').val();
            var check_all = $('#check_all').val();

            $('li').removeClass('active');
            $(this).parent().addClass('active');
            fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
        });


        $(".js-range-slider").ionRangeSlider({
            type: "double",
            step: 0.01,
            onChange: function (iondata){

            },
            onFinish: function (data) {

                $(".filter_option").removeClass('d-none');

                var filters = localStorage.getItem("filters") ? JSON.parse(localStorage.getItem("filters")) : [];
                var removeIndex = filters.findIndex( item => item.name === data.input[0].name );
                if(removeIndex > -1){
                    filters.splice( removeIndex, 1 );
                }
                filters.push({"type": "range", "name": data.input[0].name, "min": data.from, "max": data.to});

                $('#'+data.input[0].name+"_min").val(data.from)
                $('#'+data.input[0].name+"_max").val(data.to)

                localStorage.setItem('filters', JSON.stringify(filters));

                $('#filters').val(JSON.stringify(filters));
                var filters_arr = localStorage.getItem("filters");
                var query = $('#serach').val();
                var column_name = $('#hidden_column_name').val();
                var sort_type = $('#hidden_sort_type').val();
                var page = 1;
                var check_all = $('#check_all').val();

                fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
            },
        });

        $('.select-filter').select2().on('change', function(){

            $(".filter_option").removeClass('d-none');

            var filters = $('#filters').val() ? JSON.parse($('#filters').val()) : [];
            var removeIndex = filters.findIndex( item => item.name === this.name );
            if(removeIndex > -1){
                filters.splice( removeIndex, 1 );
            }
            filters.push({"type": "select", "name": this.name, "value": this.value});

            localStorage.setItem('filters', JSON.stringify(filters));

            $('#filters').val(JSON.stringify(filters));
            var filters_arr = localStorage.getItem("filters");
            var query = $('#serach').val();
            var column_name = $('#hidden_column_name').val();
            var sort_type = $('#hidden_sort_type').val();
            var page = $('#hidden_page').val();
            var check_all = $('#check_all').val();

            fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
        });

        $(document).on('click', '#reset_filters', function(event){

            $(".js-range-slider").map(function() {
                return $(this).data("ionRangeSlider").reset();
            }).get();

            $(".js-range-input").map(function() {
                $(this).val($(this).data("original-value"));

                var range_instance = $('#range_'+$(this).data("id")).data("ionRangeSlider");
                var instance_original_min = $('#'+$(this).data("id")+"_min").data("original-value")
                var instance_original_max = $('#'+$(this).data("id")+"_max").data("original-value")

                range_instance.update({
                    from: parseFloat(instance_original_min),
                    to: parseFloat(instance_original_max)
                });
            });


            // $(".select-filter").map(function() {
            //     return $("#"+this.id).val('all').trigger('change.select2');
            // }).get();

            var page = $('#hidden_page').val();
            var column_name = $('#hidden_column_name').val();
            var sort_type = $('#hidden_sort_type').val();
            var query = $('#serach').val();
            var check_all = $('#check_all').val();

            $('#filters').val('');
            var filters_arr = '';
            localStorage.clear();
            $(".filter_option").addClass('d-none');

            fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
        });

        $(document).on('change', '.row-check', function(){
            var id = $(this).val();
            if($('.check_all').checked){
                selected = JSON.parse($('#checked_rows').val());
            }
            const index = selected.findIndex(object => object === id);
            if(this.checked) {
                if (index === -1) {
                    selected.push(id);
                }
            }else{
                if (index > -1) {
                    selected.splice(index, 1)
                }
            }
            $('#checked_rows').val(JSON.stringify(selected));
            if(selected.length >= 1){
                $(".selected_buttons").removeClass('d-none')
            }else{
                $(".selected_buttons").addClass('d-none')
            }
        });

        $(document).on('change', '.check_all', function(){

            if(this.checked) {
                selected = JSON.parse($('#checked_rows').val());
                $(".selected_buttons").removeClass('d-none')
                $('#check_all').val("all");
            }else{
                selected = []
                $(".selected_buttons").addClass('d-none')
                $('#check_all').val("");
            }
            var query = $('#serach').val();
            var column_name = $('#hidden_column_name').val();
            var sort_type = $('#hidden_sort_type').val();
            var filters_arr = localStorage.getItem("filters");
            var page = $('#hidden_page').val();
            var check_all = $('#check_all').val();
            fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
        });

        $(document).on('click', '.note_form_btn', function(event){
            event.preventDefault();
            var id = $(this).data('id');
            var values = $('.note_form_'+id).serialize();

            $.ajax({
                type: "POST",
                url: "{{route('project.mol2grid.note', $data['table'])}}",
                data: values,
                dataType: "json",
                encode: true,
            }).done(function (data) {
                if(data.alert === 'success')
                    toastr.success(data.message, 'Success');
                else
                    toastr.error(data.message, 'Error');
            });
        })


        function delete_selected(){
            Swal.fire({
                text: "If you delete this, it will be gone forever.",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                cancelButtonText: "No, cancel",
                confirmButtonText: "Yes, delete!",
                customClass: {
                    cancelButton: "btn fw-bold btn-active-light-primary",
                    confirmButton: "btn fw-bold btn-danger"
                }
            }).then(function (result) {
                if (result.isConfirmed) {
                    $.ajax({
                        type: "POST",
                        url: "{{route('project.mol2grid.deleteSelected', $data['table'])}}",
                        data: {selected: $('#checked_rows').val()},
                        dataType: "json",
                        encode: true,
                        success:function(data)
                        {
                            if(data.alert === 'success'){
                                var query = $('#serach').val();
                                var column_name = $('#hidden_column_name').val();
                                var sort_type = $('#hidden_sort_type').val();
                                var filters_arr = localStorage.getItem("filters");
                                var page = $('#hidden_page').val();
                                var check_all = $('#check_all').val();
                                fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
                                toastr.success(data.message, 'Success');
                            } else{
                                toastr.error(data.message, 'Error');
                            }
                        }
                    });
                }
            });
        }


        function exportCSVFile(rows, fileTitle){
            var columns = @json($data['columns']);
            var headers = columns+"\n";
            rows.forEach((row)=>{
                console.log(row, 'row')
                var values = []
                columns.forEach((key)=>{
                    if (typeof(row[key]) == "string"){
                        values.push("\"" + row[key] + "\"")
                    } else if (typeof(row[key]) == "object"){
                        values.push("\"" + row[key].$oid + "\"")
                    } else{
                        if(row[key] == null){
                            values.push("")
                        }else{
                            values.push(row[key].toString())
                        }
                    }
                });
                headers = headers + values.join(",") + "\n"

            })
            download('CSV', fileTitle+'_'+new Date().getTime(), 'text/csv', headers)
        }

        function download(name, filename, type, data) {
            var blob = new Blob([data], {type: type});
            var url = window.URL.createObjectURL(blob);
            if(navigator.msSaveOrOpenBlob) {
                navigator.msSaveBlob(blob, name);
            } else {
                var a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            window.URL.revokeObjectURL(url);
        }

        $('#upload_selected_db').click(function (){
            $('#upload_db').modal('show');
        })

        $("#upload_form").submit(function (event) {
            console.log(JSON.parse($('#checked_rows').val()), 'selected from upload_form')

            event.preventDefault();
            var name = $("#table_name").val();

            $.ajax({
                type: "post",
                url: "{{route('project.mol2grid.uploadSelected', $data['table'])}}",
                data: {name:name, selected:JSON.parse($('#checked_rows').val())},
                dataType:'json',
                success: function (data) {
                    if (data.alert === 'success'){
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

        $('.collapse_data').click(function() {
            $(this).find('i').toggleClass('bi bi-plus-circle bi bi-dash-circle');
        });

        $('.filter_input').click(function() {

            $(".filter_option").removeClass('d-none');

            let name = $(this).data('id');
            let min = $('#'+name+'_min').val()
            let max = $('#'+name+'_max').val()

            var instance = $('#range_'+name).data("ionRangeSlider");

            instance.update({
                from: min,
                to: max
            });

            var filters = $('#filters').val() ? JSON.parse($('#filters').val()) : [];
            var removeIndex = filters.findIndex( item => item.name === name );
            if(removeIndex > -1){
                filters.splice( removeIndex, 1 );
            }
            filters.push({"type": "range", "name": name, "min": parseFloat(min), "max": parseFloat(max)});

            localStorage.setItem('filters', JSON.stringify(filters));

            $('#filters').val(JSON.stringify(filters));
            var filters_arr = localStorage.getItem("filters");
            var query = $('#serach').val();
            var column_name = $('#hidden_column_name').val();
            var sort_type = $('#hidden_sort_type').val();
            var page = $('#hidden_page').val();
            var check_all = $('#check_all').val();

            fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
        });


        $('.destroy_mol').click(function(event) {
            var id = $(this).data("id")
            event.preventDefault();
            Swal.fire({
                text: "If you delete this, it will be gone forever.",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                cancelButtonText: "No, cancel",
                confirmButtonText: "Yes, delete!",
                customClass: {
                    cancelButton: "btn fw-bold btn-active-light-primary",
                    confirmButton: "btn fw-bold btn-danger"
                }
            }).then(function (result) {
                if (result.isConfirmed) {
                    $.ajax({
                        type: "POST",
                        url: "{{route('project.mol2grid.destroy', $data['table'])}}",
                        data: {id: id},
                        dataType: "json",
                        encode: true,
                        success:function(data)
                        {
                            if(data.alert === 'success'){
                                var query = $('#serach').val();
                                var column_name = $('#hidden_column_name').val();
                                var sort_type = $('#hidden_sort_type').val();
                                var filters_arr = localStorage.getItem("filters");
                                var page = $('#hidden_page').val();
                                var check_all = $('#check_all').val();
                                fetch_data(page, sort_type, column_name, query, filters_arr, check_all);
                                toastr.success(data.message, 'Success');
                            } else{
                                toastr.error(data.message, 'Error');
                            }
                        }
                    });
                }
            });
        });

        $('#filter_option_trash').click(function(event) {
            $(".filter_option").addClass('d-none');
            localStorage.clear();
            location.reload();
        })

        $('#save_filter_node').click(function(event) {
            $(".global_loading").removeClass('d-none');
            var filters_arr = localStorage.getItem("filters");
            var project = '{{$data["project"]}}';
            var run = '{{$data["table"]}}';
            var count = $('#count').val();
            var main_node = @json($data['node']);
            $.ajax({
                type: "POST",
                url: "{{route('project.node')}}",
                data: {project: project, run: run, filters:filters_arr, count: count, parent_id: main_node && main_node !== 'undefined' ? main_node.id : null, type:'filtering'},
                dataType: "json",
                encode: true,
            }).done(function (data) {
                if(data.alert === 'success'){
                    toastr.success(data.message, 'Success');
                    $(".filter_option").addClass('d-none');
                    localStorage.clear();
                    setTimeout(() => {
                        window.location.href ='/project/pipeline/{{$data['project']}}/{{explode('_filtered_', $data['table'])[0]}}';
                    }, 1500);
                } else{
                    toastr.error(data.message, 'Error');
                }
            });
        })

</script>


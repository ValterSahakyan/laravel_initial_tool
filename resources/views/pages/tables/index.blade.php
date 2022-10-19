<x-base-layout>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css">
    <style>
        .toast-error{
            background-color: #F64E60 !important;
        }
        .toast-success{
            background-color: #50CD89 !important;
        }
    </style>
    <!--begin::Card-->
    <div class="card">
        <!--begin::Card body-->
        <div class="card-body pt-6">
            <table class="table table-row-bordered analysis_datatable">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Action</th>
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
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': jQuery('meta[name="csrf-token"]').attr('content')
        }
    });

    $(function () {
        var table = $('.analysis_datatable').DataTable({
            processing: true,
            serverSide: true,
            paging: true,
            pageLength: 10,
            ordering : false,
            ajax: "{{ route('tables.index') }}",
            columns: [
                {data: 'name', name: 'name'},
                {data: 'action', name: 'action', orderable: false, searchable: false},
            ]
        });
    });

    $(document).on('click', '.remove-row', function(){
       let name = $(this).data('id')
        $.ajax({
            type: "get",
            url: "/remove-table/"+name,
            dataType:'json',
            success: function (data) {
                if(data.alert === "success"){
                    toastr.success(data.message, 'Success');
                    $('.analysis_datatable').DataTable().draw()
                }else{
                    toastr.error('Something went wrong please try again!', 'Error');
                }
            }
        });
    })

</script>

<x-base-layout>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css">
    <!--begin::Card-->
    <div class="col-12">
        <a href="" class="btn"> <i class="fas fa-arrow-left"></i> Back</a>
        <a href="{{route('computations.create')}}" type="button" class="btn btn-primary btn-sm fa-pull-right">
            <i class="bi bi-plus"></i>
            Add New Computation
        </a>
    </div>
    <div class="card">
        <!--begin::Card body-->
        <div class="card-body pt-6">
            <table class="table table-row-bordered analysis_datatable">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>File</th>
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
            ajax: "{{ route('computations.index') }}",
            columns: [
                {data: 'name', name: 'name'},
                {data: 'file', name: 'File'},
                {data: 'action', name: 'action', orderable: false, searchable: false},
            ]
        });
    });

    $(document).on('click', '.remove-row', function(){
        let id = $(this).data('id')
        $.ajax({
            type: "get",
            url: "/remove-computation/"+id,
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

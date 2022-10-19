<x-base-layout>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css">
    <!--begin::Card-->
    <a href="{{ URL::previous() }}" class="btn"> <i class="fas fa-arrow-left"></i> Back</a>

    <div class="card">
        <!--begin::Card body-->
        <div class="card-body pt-6">
            <table class="table table-row-bordered analysis_datatable">
                <thead>
                <tr>
                    <th>ID</th>
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
            serverSide: false,
            paging: true,
            pageLength: 10,
            ordering : false,
            ajax: "{{ route('projects.runs', $project) }}",
            columns: [
                {data: 'id', name: 'ID'},
                {data: 'name', name: 'Name'},
                {data: 'action', name: 'action', orderable: false, searchable: false},
            ]
        });
    });


</script>

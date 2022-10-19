<x-base-layout>
<style>
    *, *:before, *:after {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }

    body {
        min-width: 1200px;
        margin: 0;
        padding: 50px;
        color: #ffffff;
        font: 16px Verdana, sans-serif;
        background: #2e6ba7;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    #wrapper {
        position: relative;
        margin-bottom: 150px;
    }

    .branch {
        position: relative;
        margin-left: 500px;
    }
    .branch:before {
        content: "";
        width: 50px;
        border-top: 2px solid #ffffff;
        position: absolute;
        left: -100px;
        top: 50%;
        margin-top: 1px;
    }

    .entry {
        position: relative;
        min-height: 400px;
    }
    .entry:before {
        content: "";
        height: 100%;
        border-left: 2px solid #ffffff;
        position: absolute;
        left: -50px;
    }
    .entry:after {
        content: "";
        width: 50px;
        border-top: 2px solid #ffffff;
        position: absolute;
        left: -50px;
        top: 50%;
        margin-top: 1px;
    }
    .entry:first-child:before {
        width: 10px;
        height: 50%;
        top: 50%;
        margin-top: 2px;
        border-radius: 10px 0 0 0;
    }
    .entry:first-child:after {
        height: 10px;
        border-radius: 10px 0 0 0;
    }
    .entry:last-child:before {
        width: 10px;
        height: 50%;
        border-radius: 0 0 0 10px;
    }
    .entry:last-child:after {
        height: 10px;
        border-top: none;
        border-bottom: 2px solid #ffffff;
        border-radius: 0 0 0 10px;
        margin-top: -9px;
    }
    .entry.sole:before {
        display: none;
    }
    .entry.sole:after {
        width: 50px;
        height: 0;
        margin-top: 1px;
        border-radius: 0;
    }

    .label {
        display: block;
        min-width: 400px;
        position: absolute;
        left: 0;
        top: 50%;
        margin-top: -15px;
    }
    .accordion.accordion-icon-toggle .accordion-icon i{
        color: #009EF7 !important;
    }
</style>
    <div class="row gy-5 g-xl-8">
        <div id="wrapper">
            <div class="col-xxl-4 label">
                <div class="card card-xl-stretch mb-5 mb-xl-8">
                    <div class="card-header border-0 pt-5">
                        <h2 class="card-title align-items-start flex-column">
                            <span class="card-label fw-bolder text-dark">{{$project}}</span>
                            <span class="text-muted mt-1 fw-bold fs-7">{{$run}}</span>
                        </h2>
                        <div class="card-toolbar">
                            <button type="button" class="btn btn-sm btn-icon btn-color-primary btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                                {!! theme()->getSvgIcon("icons/duotune/arrows/arr009.svg", "svg-icon-2"); !!}
                            </button>
                            <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-bold w-200px py-3" data-kt-menu="true">
                                <div class="menu-item px-3">
                                    <a href="{{route('project.mol2grid', [$project, $run])}}" class="menu-link px-3">
                                        Filtering Node
                                    </a>
                                </div>
                                <div class="menu-item px-3">
                                    <a href="{{route('project.computation', [$project, $run])}}" class="menu-link flex-stack px-3">
                                        Computation Node
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body pt-5">
                        <div class="d-flex align-items-sm-center">
                            <div class="d-flex align-items-center flex-row-fluid flex-wrap">
                                <div class="flex-grow-1 me-2">
                                    <span href="#" class="text-gray-800 text-hover-primary fs-6 fw-bolder">Molecules -</span>
                                    <span class="badge badge-light fw-bolder my-2">{{$count}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            @if(count($nodes) > 0)
                <div class="branch">
                    @foreach($nodes as $node)
                        <div class="entry @if(count($nodes) <=1) sole @endif">
                            <div class="col-xxl-4 label">
                                <div class="card card-xl-stretch mb-5 mb-xl-8">
                                    <div class="card-header border-0 pt-5">
                                        <h3 class="card-title align-items-start flex-column">
                                            @if($node->type == 'filtering')
                                                <span class="card-label fw-bolder text-dark">Filtering Node </span>
                                                <span class="text-muted mt-1 fw-bold fs-7">Reward Filter</span>
                                            @else
                                                <span class="card-label fw-bolder text-dark">Computation Node</span>
                                                <span class="card-label fw-bolder text-dark">{{$node->computation->name}}</span>
                                                <span class="text-muted mt-1 fw-bold fs-7">{{$node->computation->file}}</span>
                                            @endif
                                        </h3>

                                        <div class="card-toolbar">
                                            <button type="button" class="btn btn-sm btn-icon btn-color-danger btn-active-light-danger" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                                                {!! theme()->getSvgIcon("icons/duotune/general/gen024.svg", "svg-icon-2") !!}
                                            </button>
                                            <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-danger fw-bold w-200px py-3" data-kt-menu="true">
                                                <div class="menu-item px-3">
                                                    <span class="menu-link px-3 delete_node" data-id="{{$node->id}}">
                                                        <i class="bi bi-trash fs-4 me-2 text-danger"></i>
                                                        Delete Node
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        @if($node->executed)
                                            <div class="card-toolbar">
                                                <button type="button" class="btn btn-sm btn-icon btn-color-primary btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                                                    {!! theme()->getSvgIcon("icons/duotune/arrows/arr009.svg", "svg-icon-2"); !!}
                                                </button>
                                                <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-bold w-200px py-3" data-kt-menu="true">
                                                    <div class="menu-item px-3">
                                                        <a href="{{route('project.mol2grid', [$project, $node->run])}}" class="menu-link px-3">
                                                            Filtering Node
                                                        </a>
                                                    </div>
                                                    <div class="menu-item px-3">
                                                        <a href="{{route('project.computation', [$project, $node->run])}}" class="menu-link flex-stack px-3">
                                                            Computation Node
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        @endif
                                    </div>

                                    <div class="card-body pt-5">
                                        @if($node->type == 'filtering')
                                            <div class="d-flex align-items-sm-center">
                                                <div class="d-flex align-items-center flex-row-fluid flex-wrap">
                                                    <div class="flex-grow-1 me-2">
                                                        <span class="text-gray-800 text-hover-primary fs-6 fw-bolder">IN -</span>
                                                        <span class="badge badge-light fw-bolder my-2">{{$node->in}}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="d-flex align-items-sm-center">
                                                <div class="d-flex align-items-center flex-row-fluid flex-wrap">
                                                    <div class="flex-grow-1 me-2">
                                                        <span class="text-gray-800 text-hover-primary fs-6 fw-bolder">OUT -</span>
                                                        <span class="badge badge-light fw-bolder my-2">{{$node->out}}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="accordion accordion-icon-toggle" id="kt_accordion_{{$node->id}}">
                                                <div>
                                                    <div class="accordion-header py-3 d-flex collapsed" data-bs-toggle="collapse" data-bs-target="#kt_accordion_{{$node->id}}_item_2">
                                                        <span class="accordion-icon"><i class="bi bi-arrow-right"></i></span>
                                                        <h3 class="fs-4 fw-bold mb-0 ms-4">Filtering options</h3>
                                                    </div>

                                                    <div id="kt_accordion_{{$node->id}}_item_2" class="collapse fs-6 ps-10" data-bs-parent="#kt_accordion_{{$node->id}}">
                                                        @if($node->filter_options)
                                                            @foreach(json_decode($node->filter_options) as $option)
                                                                <div class="d-flex align-items-sm-center">
                                                                    <div class="d-flex align-items-center flex-row-fluid flex-wrap">
                                                                        <div class="flex-grow-1 me-2">
                                                                            @if($option->type == 'range')
                                                                                <span class="badge badge-light-primary">{{$option->name}} - ({{$option->min}} - {{$option->max}}) </span>
                                                                            @else
                                                                                <span class="badge badge-light-primary">{{$option->name}} - {{$option->value}}</span>
                                                                            @endif
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            @endforeach
                                                        @endif
                                                    </div>
                                                </div>
                                            </div>
                                        @else
                                            <div class="d-flex align-items-sm-center">
                                                <div class="d-flex align-items-center flex-row-fluid flex-wrap">
                                                    <div class="flex-grow-1 me-2">
                                                        <button id="execute_computation" data-id="{{$node->id}}" class="btn {{$node->executed ? 'btn-info' : 'btn-primary'}}" {{$node->executed ? 'disabled' : ''}}>
                                                               {{$node->executed ? 'Executed' : 'Execute'}}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        @endif

                                    </div>
                                </div>
                            </div>
                            @if(count($node->childs))
                                @include('pages.projects.nodeChild',['childs' => $node->childs])
                            @endif
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</x-base-layout>
<script>

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': jQuery('meta[name="csrf-token"]').attr('content')
        }
    });

    $(document).on('click', '#execute_computation', function(event){
        var id = $(this).data("id");
        Swal.fire({
            text: "Execute?",
            icon: "primary",
            showCancelButton: true,
            buttonsStyling: false,
            cancelButtonText: "No, cancel",
            confirmButtonText: "Yes!",
            customClass: {
                cancelButton: "btn fw-bold btn-active-light-info",
                confirmButton: "btn fw-bold btn-primary"
            }
        }).then(function (result) {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "{{route('project.execute_computation')}}",
                    data: {id: id},
                    dataType: "json",
                    encode: true,
                    success:function(data)
                    {
                        if(data.alert === 'success'){
                            toastr.success(data.message, 'Success');
                            location.reload();
                        } else{
                            toastr.error(data.message, 'Error');
                        }
                    }
                });
            }
        });
    })

    $(document).on('click', '.delete_node', function(event){
        var id = $(this).data("id");
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
                    url: "{{route('project.destroy_node')}}",
                    data: {id: id},
                    dataType: "json",
                    encode: true,
                    success:function(data)
                    {
                        if(data.alert === 'success'){
                            toastr.success(data.message, 'Success');
                            location.reload();
                        } else{
                            toastr.error(data.message, 'Error');
                        }
                    }
                });
            }
        });
    })
</script>

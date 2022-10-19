<div class="branch">
    @foreach($childs as $child)
        <div class="entry @if(count($childs) <=1) sole @endif">
            <div class="col-xxl-4 label">
                <div class="card card-xl-stretch mb-5 mb-xl-8">
                    <div class="card-header border-0 pt-5">
                        <h3 class="card-title align-items-start flex-column">
                            @if($child->type == 'filtering')
                                <span class="card-label fw-bolder text-dark">Filtering Node </span>
                                <span class="text-muted mt-1 fw-bold fs-7">Reward Filter</span>
                            @else
                                <span class="card-label fw-bolder text-dark">Computation Node</span>
                                <span class="card-label fw-bolder text-dark">{{$child->computation->name}}</span>
                                <span class="text-muted mt-1 fw-bold fs-7">{{$child->computation->file}}</span>
                            @endif
                        </h3>

                        <div class="card-toolbar">
                            <button type="button" class="btn btn-sm btn-icon btn-color-danger btn-active-light-danger" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                                {!! theme()->getSvgIcon("icons/duotune/general/gen024.svg", "svg-icon-2") !!}
                            </button>
                            <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-danger fw-bold w-200px py-3" data-kt-menu="true">
                                <div class="menu-item px-3">
                                     <span class="menu-link px-3 delete_node" data-id="{{$child->id}}">
                                        <i class="bi bi-trash fs-4 me-2 text-danger"></i>
                                        Delete Node
                                     </span>
                                </div>
                            </div>
                        </div>

                        @if($child->executed)
                            <div class="card-toolbar">
                                <button type="button" class="btn btn-sm btn-icon btn-color-primary btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                                    {!! theme()->getSvgIcon("icons/duotune/arrows/arr009.svg", "svg-icon-2"); !!}
                                </button>

                                <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-bold w-200px py-3" data-kt-menu="true">
                                    <div class="menu-item px-3">
                                        <a href="{{route('project.mol2grid', [$project, $child->run])}}" class="menu-link px-3">
                                            Filtering Node
                                        </a>
                                    </div>
                                    <div class="menu-item px-3">
                                        <a href="{{route('project.computation', [$project, $child->run])}}" class="menu-link flex-stack px-3">
                                            Computation Node
                                        </a>
                                    </div>
                                </div>
                            </div>
                        @endif
                    </div>

                    <div class="card-body pt-5">
                        @if($child->type == 'filtering')
                            <div class="d-flex align-items-sm-center">
                                <div class="d-flex align-items-center flex-row-fluid flex-wrap">
                                    <div class="flex-grow-1 me-2">
                                        <span class="text-gray-800 text-hover-primary fs-6 fw-bolder">IN -</span>
                                        <span class="badge badge-light fw-bolder my-2">{{$child->in}}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex align-items-sm-center">
                                <div class="d-flex align-items-center flex-row-fluid flex-wrap">
                                    <div class="flex-grow-1 me-2">
                                        <span class="text-gray-800 text-hover-primary fs-6 fw-bolder">OUT -</span>
                                        <span class="badge badge-light fw-bolder my-2">{{$child->out}}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="accordion accordion-icon-toggle" id="kt_accordion_{{$child->id}}">
                                <div>
                                    <div class="accordion-header py-3 d-flex collapsed" data-bs-toggle="collapse" data-bs-target="#kt_accordion_{{$child->id}}_item_1">
                                        <span class="accordion-icon"><i class="bi bi-arrow-right"></i></span>
                                        <h3 class="fs-4 fw-bold mb-0 ms-4">Filtering options</h3>
                                    </div>

                                    <div id="kt_accordion_{{$child->id}}_item_1" class="collapse fs-6 ps-10" data-bs-parent="#kt_accordion_{{$child->id}}">
                                        @if($child->filter_options)
                                            @foreach(json_decode($child->filter_options) as $option)
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
                                        <button id="execute_computation" data-id="{{$child->id}}" class="btn {{$child->executed ? 'btn-info' : 'btn-primary'}}" {{$child->executed ? 'disabled' : ''}}>
                                            {{$child->executed ? 'Executed' : 'Execute'}}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        @endif

                    </div>
                </div>
            </div>
            @if(count($child->childs))
                @include('pages.projects.nodeChild',['childs' => $child->childs])
            @endif
        </div>
    @endforeach
</div>

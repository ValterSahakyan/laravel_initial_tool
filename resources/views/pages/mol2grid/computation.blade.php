<x-base-layout>
    <!--begin::List Widget 3-->
    <div class="card card-xxl-stretch mb-xl-3">
    <!--begin::Header-->
    <div class="card-header border-0">
        <h3 class="card-title fw-bolder text-dark">Select Computation</h3>
    </div>
    <!--end::Header-->

        <form id="save_computation_node" class="form" method="POST" action="{{route('project.computation_node')}}" enctype="multipart/form-data">
        @csrf
            <!--begin::Body-->
            <div class="card-body pt-2">
                @foreach($computations as $computation)
                <!--begin::Item-->
                    <div class="d-flex align-items-center mb-8">
                        <!--begin::Bullet-->
                        <span class="bullet bullet-vertical h-40px bg-warning"></span>
                        <!--end::Bullet-->

                        <!--begin::Checkbox-->
                        <div class="form-check form-check-custom form-check-solid mx-5">
                            <input class="form-check-input" type="radio" name="computation_id" value="{{$computation->id}}"/>
                            <input type="hidden" name="project" value="{{$project}}"/>
                            <input type="hidden" name="run" value="{{$run}}"/>
                            <input type="hidden" name="type" value="computation"/>
                            <input type="hidden" name="parent_id" value="{{$node->id ?? null}}"/>
                        </div>
                        <!--end::Checkbox-->

                        <!--begin::Description-->
                        <div class="flex-grow-1">
                            <span class="text-gray-800 text-hover-primary fw-bolder fs-6">{{ $computation->name }}</span>
                            <span class="text-muted fw-bold d-block">{{ $computation->file }}</span>
                        </div>
                        <!--end::Description-->
                    </div>
                    <!--end:Item-->
                @endforeach
            </div>
            <!--end::Body-->
            <!--begin::Actions-->
            <div class="card-footer d-flex justify-content-end py-6 px-9">
                <button type="submit" class="btn btn-primary" id="computation_node_submit">
                    @include('partials.general._button-indicator', ['label' => __('Save Computation node')])
                </button>
            </div>
            <!--end::Actions-->
        </form>
</div>
    <!--end:List Widget 3-->
</x-base-layout>

<x-base-layout>
    <!--begin::Basic info-->
    <div class="card mb-5 mb-xl-10">
        <!--begin::Card header-->
        <div class="card-header border-0 cursor-pointer" role="button" data-bs-toggle="collapse" data-bs-target="#computation_node" aria-expanded="true" aria-controls="computation_node">
            <!--begin::Card title-->
            <div class="card-title m-0">
                <h3 class="fw-bolder m-0">{{ __('Computation Node') }}</h3>
            </div>
            <!--end::Card title-->
        </div>
        <!--begin::Card header-->

        <!--begin::Content-->
        <div id="computation_node" class="collapse show">
            <!--begin::Form-->
            <form id="computation_node_form" class="form" method="POST" action="{{route('computations.update', $computation->id)}}" enctype="multipart/form-data">
                @csrf
                <div class="card-body border-top p-9">

                    <div class="row mb-6">
                        <!--begin::Label-->
                        <label class="col-lg-2 col-form-label required fw-bold fs-6">{{ __('Computation Name') }}</label>
                        <!--end::Label-->

                        <!--begin::Col-->
                        <div class="col-lg-8 fv-row">
                            <input type="text" name="name" class="form-control form-control-lg form-control-solid {{ $errors->has('name') ? ' is-invalid' : '' }}" placeholder="Computation name" value="{{ $computation->name ?? old('name') }}"/>
                            @if ($errors->has('name'))
                                <span class="invalid-feedback">{{ $errors->first('name') }}</span>
                            @endif

                        </div>
                        <!--end::Col-->
                    </div>

                    <div class="row mb-6 mt-8">
                        <!--begin::Label-->
                        <label class="col-lg-2 col-form-label required fw-bold fs-6">{{ __('File') }}</label>
                        <!--end::Label-->
                        <!--begin::Col-->
                        <div class="col-lg-6">
                            <input type="file" name="file" accept="application/json,.py" class="form-control form-control-lg form-control-solid {{ $errors->has('file') ? ' is-invalid' : '' }}">
                            @if ($errors->has('file'))
                                <span class="invalid-feedback">{{ $errors->first('file') }}</span>
                            @endif
                        </div>
                        <div class="col-lg-2">
                            <div class="align-items-center bg-light-primary rounded p-4">
                                <div class="flex-grow-1 me-2">
                                    {{$computation->file}}
                                    <input type="hidden" name="old_file" value="{{$computation->file}}">
                                </div>
                            </div>
                        </div>
                        <!--end::Col-->
                    </div>

                </div>

                <!--begin::Actions-->
                <div class="card-footer d-flex justify-content-end py-6 px-9">
                    <button type="reset" class="btn btn-white btn-active-light-primary me-2">{{ __('Discard') }}</button>

                    <button type="submit" class="btn btn-primary" id="computation_node_submit">
                        @include('partials.general._button-indicator', ['label' => __('Save')])
                    </button>
                </div>
                <!--end::Actions-->
            </form>
            <!--end::Form-->
        </div>
        <!--end::Content-->
    </div>
    <!--end::Basic info-->

</x-base-layout>

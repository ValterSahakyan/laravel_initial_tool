<x-base-layout>
    <div class="card">
            <!--begin::Form-->
            <form class="form" method="POST" action="{{ route('upload_db.uploadCsvTxt') }}" enctype="multipart/form-data">
            @csrf
            <!--begin::Card body-->
                <div class="card-body border-top p-9">

                    <!--begin::Input group-->
                    <div class="row mb-6">
                        <!--begin::Label-->
                        <label class="col-lg-2 col-form-label required fw-bold fs-6">{{ __('Table Name') }}</label>
                        <!--end::Label-->

                        <!--begin::Col-->
                        <div class="col-lg-8">
                            <!--begin::Row-->
                            <div class="row">
                                <!--begin::Col-->
                                <div class="col-lg-12 fv-row">
                                    <input type="text" name="name" class="table_name form-control form-control-lg form-control-solid mb-3 mb-lg-0" placeholder="Table name" value="{{ old('table_name') }}"/>
                                </div>
                                <!--end::Col-->
                            </div>
                            <!--end::Row-->
                        </div>
                        <!--end::Col-->
                    </div>
                    <!--end::Input group-->
                    <!--begin::Input group-->
                    <div class="row mb-6">
                        <!--begin::Label-->
                        <label class="col-lg-2 col-form-label required fw-bold fs-6">{{ __('File') }}</label>
                        <!--end::Label-->
                        <!--begin::Col-->
                        <div class="col-lg-8">
                            <input type="file" name="file">
                        </div>
                        <!--end::Col-->
                    </div>
                    <!--end::Input group-->
                    <!--begin::Actions-->
                    <div class="card-footer d-flex justify-content-end py-6 px-9">
                        <button type="submit" id="upload" class="btn btn-white btn-primary me-2">{{ __('Upload') }}</button>
                    </div>
                </div>
            </form>
            <!--end::Form-->
        <!--end::Content-->
    </div>

</x-base-layout>

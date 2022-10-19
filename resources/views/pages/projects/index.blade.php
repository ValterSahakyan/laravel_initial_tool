<x-base-layout>

    <div class="text-center pt-5 pb-15">
        <h2 class="fs-2x fw-bolder mb-0">Projects</h2>
    </div>
    <div class="row gy-5 gx-xl-8">
        @foreach($data as $value)
            <!--begin::Col-->
            <div class="col-xl-4 h-450px">
                <?php
                // List items
                $listRows = array(
                    array(
                        'color' => 'success',
                        'icon' => 'icons/duotune/abstract/abs027.svg',
                        'title' => 'Pipeline',
                        'route' => 'project/runs/'.$value['name'],
                    ),
                    array(
                        'color' => 'danger',
                        'icon' => 'icons/duotune/communication/com012.svg',
                        'title' => 'Data Visualization',
                        'route' => '',
                    ),
                    array(
                        'color' => 'info',
                        'icon' => 'icons/duotune/communication/com012.svg',
                        'title' => 'General Information',
                        'route' => '',
                    )
                );
                ?>

            <!--begin::List Widget 6-->
                <div class="card card-xl-stretch mb-xl-8">
                    <!--begin::Header-->
                    <div class="card-header border-0 ">
                        <h3 class="card-title fw-bolder text-dark">{{$value['name']}}</h3>
                    </div>
                    <!--end::Header-->

                    <!--begin::Body-->
                    <div class="card-body pt-0">
                    @foreach($listRows as $row)
                        <!--begin::Item-->
                            <a href="{{$row['route']}}" class="fw-bolder text-gray-800 text-hover-primary fs-6">
                                <div class="mt-12 d-flex align-items-center bg-light-{{ $row['color'] }} rounded p-5 {{ util()->putIf(next($listRows), 'mb-7') }}">
                                    <!--begin::Icon-->
                                    <span class="svg-icon svg-icon-{{ $row['color'] }} me-5">
                                        {!! theme()->getSvgIcon("icons/duotune/abstract/abs027.svg", "svg-icon-1"); !!}
                                    </span>
                                    <!--end::Icon-->

                                    <!--begin::Title-->
                                    <div class="flex-grow-1 me-2">
                                        {{ $row['title'] }}
                                    </div>
                                    <!--end::Title-->

                                    <!--begin::Lable-->
                                    <span class="fw-bolder text-{{ $row['color'] }} py-1"></span>
                                    <!--end::Lable-->
                                </div>
                            </a>
                            <!--end::Item-->
                        @endforeach
                    </div>
                    <!--end::Body-->
                </div>
            <!--end::List Widget 6-->
        </div>
            <!--end::Col-->
        @endforeach
            <div class="col-xl-4 h-450px">

            <!--begin::List Widget 6-->
                <div class="card card-xl-stretch mb-xl-8">
                    <!--begin::Body-->
                    <div class="card-body pt-0">
                        <!--begin::Item-->
                            <a href="add-project" class="position-relative top-50 fw-bolder text-gray-800 text-hover-success fs-6">
                                <div class="d-flex align-items-center bg-light-primary rounded p-5">
                                    <!--begin::Icon-->
                                    <span class="svg-icon svg-icon-primary me-5">
                                        {!! theme()->getSvgIcon("icons/duotune/arrows/arr009.svg", "svg-icon-1"); !!}
                                    </span>
                                    <!--end::Icon-->

                                    <!--begin::Title-->
                                    <div class="flex-grow-1 me-2">
                                       Add Project
                                    </div>
                                    <!--end::Title-->
                                </div>
                            </a>
                            <!--end::Item-->
                    </div>
                    <!--end::Body-->
                </div>
                <!--end::List Widget 6-->
            </div>
    </div>
    <!--end::Row-->
</x-base-layout>


<x-base-layout>
    <style>
        .timeline-label{
            width: 150px !important;
        }
        .copied{
            color: #0BB783;
            opacity: 0;
            position: absolute;
            right: -40px;
        }
        .mol-container {
            width: 100%;
            height: 600px;
            position: relative;
        }
    </style>
    <script src="https://unpkg.com/smiles-drawer@1.0.10/dist/smiles-drawer.min.js"></script>

    <a href="{{ URL::previous() }}" class="btn"> <i class="fas fa-arrow-left"></i> Back</a>

<div class="card">
    <div class="card-body pt-9 pb-0">
        <!--begin::Details-->
        <div class="d-flex flex-wrap flex-sm-nowrap mb-3">
            <!--begin: Pic-->
            <div class="me-7 mb-4">
                <div class="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                    <canvas id="smiles_{{$data['_id']}}"></canvas>
                </div>
            </div>
            <!--end::Pic-->

            <!--begin::Info-->
            <div class="flex-grow-1">
                <!--begin::Title-->
                <div class="d-flex justify-content-between align-items-start flex-wrap mb-2">
                    <!--begin::User-->
                    <div class="d-flex flex-column col-lg-12">
                        <!--begin::Info-->
                        <div class="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                            <!--begin::List Widget 5-->
                            <div class="card col-lg-12">
                                <!--begin::Header-->
                                <div class="card-header align-items-center border-0 mt-4">
                                    <h3 class="card-title align-items-start flex-column">
                                        <span class="fw-bolder mb-2 text-dark">{{ $data['SMILES'] }}
                                            <button class="btn btn-icon-primary btn-light-success me-3 btn-sm" onclick=copyToClipboard('{{$data['SMILES']}}')>
                                                <i class="bi bi-clipboard"></i>
                                            </button>
                                        </span>
                                        <span class="copied la-pull-right">Copied !</span>

                                    </h3>
                                </div>
                                <!--end::Header-->
                                <div class="card-body align-items-center border-0 mt-4">
                                    @foreach($data as $key => $value)
                                        <div class="row mb-4 border">
                                            <label class="col-lg-4 fw-bold">{{ ucfirst(str_replace('_', ' ', $key))}}</label>
                                            <div class="col-lg-8">
                                                <span class="fw-bolder fs-6 text-dark">{{ $value }}</span>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                            <!--end: List Widget 5-->
                        </div>
                        <!--end::Info-->
                    </div>
                    <!--end::User-->
                </div>
                <!--end::Title-->
            </div>
            <!--end::Info-->
        </div>
        <!--end::Details-->

        <!--begin::Navs-->
        <div class="card mb-5 mb-xl-10" id="molview">
            <!--begin::Card header-->
            <div class="card-header cursor-pointer">
                <!--begin::Card title-->
                <div class="card-title m-0">
                    <h3 class="fw-bolder m-0">{{ __('3D Mol View') }}</h3>
                </div>
            </div>
            <!--begin::Card header-->

            <!--begin::Card body-->
            <div class="card-body p-9">
                <div id="con" style="width: 100%; height: 800px;">
                </div>
            </div>
            <!--end::Card body-->
        </div>
        <div class="card mb-5 mb-xl-10" id="PubChem">
            <!--begin::Card header-->
            <div class="card-header cursor-pointer">
                <!--begin::Card title-->
                <div class="card-title m-0">
                    <h3 class="fw-bolder m-0">{{ __('PubChem') }}</h3>
                </div>
            </div>
            <!--begin::Card header-->

            <!--begin::Card body-->
            <div class="card-body p-9">
                <iframe width="100%" height="800" src="{{url('https://pubchem.ncbi.nlm.nih.gov/#query='.$data['SMILES'])}}"></iframe>
            </div>
            <!--end::Card body-->
        </div>
        <div class="card mb-5 mb-xl-10" id="SwissADME">
            <div class="card-header cursor-pointer">
                <!--begin::Card title-->
                <div class="card-title m-0">
                    <h3 class="fw-bolder m-0">{{ __('SwissADME') }}</h3>
                </div>
            </div>
            <!--begin::Card body-->
            <div class="card-body p-9">
{{--                <iframe id="swissadme" width="100%" height="1000" src="{{url('http://www.swissadme.ch/index.php')}}"></iframe>--}}
            </div>
            <!--end::Card body-->
        </div>
        <!--begin::Navs-->
    </div>
</div>
<!--end::Navbar-->
</x-base-layout>
<script src="/3Dmol/acticm.js"></script>
<script>
    var mole_count = '{{count($molecules_arr)}}';
    var molecules = @json($molecules_arr);
    var current_mol = 0;

    function onLoadActiveIcm()
    {
        if(mole_count >=0){
            document.act =  new ActiveIcmJS("con");
            document.act.cookiesEnabled = true;
            colorBG();
            document.act.projectFile = molecules[current_mol]['path'];
            document.act.left.onmousedown = function () {
                if(current_mol !==0 && current_mol <= mole_count){
                    current_mol--
                }else{
                    current_mol = mole_count - 1
                }
                document.act.projectFile = molecules[current_mol]['path'];
            };

            document.act.right.onmousedown = function () {
                if(current_mol >= 0 && current_mol !== (mole_count-1)){
                    current_mol++
                }else{
                    current_mol = 0
                }
                document.act.projectFile = molecules[current_mol]['path'];
            };
        }
    }

    function colorBG()
    {
        var c = "#000000";
        document.act.RunCommands("color background rgb =  { " + parseInt(c.substring(1,3),16) + "," +
            parseInt(c.substring(3,5),16) + "," + parseInt(c.substring(5,7),16) + "}"  );
    }

    var smilesDrawer = new SmilesDrawer.Drawer({width: 400, height: 300});
    SmilesDrawer.parse('{{$data['SMILES']}}', function (tree) {
        smilesDrawer.draw(tree, "smiles_{{$data['_id']}}", "light", false);
    })


    function copyToClipboard(text) {
        var sampleTextarea = document.createElement("textarea");
        document.body.appendChild(sampleTextarea);
        sampleTextarea.value = text;
        sampleTextarea.select();
        document.execCommand("copy");
        document.body.removeChild(sampleTextarea);

        $(".copied").animate({ top: -25, opacity: 1 }, 700, function() {
            $(this).css({ top: 0, opacity: 0 });
        });
    }

</script>

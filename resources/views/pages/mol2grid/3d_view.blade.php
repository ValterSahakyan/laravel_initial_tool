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

    <a href="{{ URL::previous() }}" class="btn"> <i class="fas fa-arrow-left"></i> Back</a>

    <div class="card">
        <div class="card-body pt-9 pb-0">
            <div class="card mb-5 mb-xl-10" id="molview">
                <!--begin::Card header-->
                <div class="card-header cursor-pointer">
                    <!--begin::Card title-->
                    <div class="card-title m-0">
                        <h3 class="fw-bolder m-0">{{ __('3D Mol View') }}</h3>
                    </div>
                </div>
                <!--begin::Card header-->

                @php
                  var_dump($ids);
                @endphp
                <!--begin::Card body-->
                <div class="card-body p-9">
                    <div id="con" style="width: 100%; height: 800px;">
                    </div>
                </div>
                <!--end::Card body-->
            </div>
        </div>
    </div>
    <!--end::Navbar-->
</x-base-layout>
<script src="/3Dmol/acticm.js"></script>

<script>

    // jQuery.ajax( 'http://10.10.200.71/denovo/data/misc/3tzr/3tzr-scaffold4-r1-id19898_in.pdb', {
    //     success: function(data) {
    //         console.log(data, 'kklklklkl')
    //     },
    //     error: function(hdr, status, err) {
    //         console.error( "Failed to load PDB " + err );
    //     },
    // });

    function onLoadActiveIcm()
    {
        document.act =  new ActiveIcmJS("con");
        document.act.cookiesEnabled = true;
        colorBG();
        document.act.projectFile = "/5t2p-f15-r1-id47052_out.pdbqt"
    }

    function colorBG()
    {
        var c = "#000000";
        document.act.RunCommands("color background rgb =  { " + parseInt(c.substring(1,3),16) + "," +
            parseInt(c.substring(3,5),16) + "," + parseInt(c.substring(5,7),16) + "}"  );
    }
</script>

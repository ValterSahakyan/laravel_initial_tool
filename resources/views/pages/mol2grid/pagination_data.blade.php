@foreach($data['result'] as $key => $value)
    <tr>
        @foreach($data['columns'] as $column)
            @if($column === '_id')
                <td>
                    <label class="form-check form-check-inline form-check-solid">
                        <input class="row-check form-check-input" name="checked[{{$key}}]"  @if(isset($check_all) && $check_all === 'all') checked="checked" @endif type="checkbox" value="{{$value['Mol_ID']}}"/>
                        <span class="fw-bold ps-2 fs-6">{{$value['_id']}}</span>
                    </label>
                    <br>
                    <a href="{{route('project.mol2grid_view', [$data['project'], $data['table'], $value['_id']])}}" class="btn btn-light-info btn-sm mt-4">
                        <i class="bi bi-eye"></i>
                    </a>
                    <button type="button" class="btn btn-light-primary btn-sm mt-4 collapse_data" data-bs-toggle="collapse" href="#collapse{{$value['_id']}}" role="button" aria-expanded="false" aria-controls="collapse{{$value['_id']}}">
                        <i class="bi bi-plus-circle"></i>
                    </button>
                    <button type="button" class="btn btn-light-primary btn-sm mt-4" data-bs-toggle="collapse" href="#collapse_{{$value['_id']}}" role="button" aria-expanded="false" aria-controls="collapse_{{$value['_id']}}">
                        <i class="bi bi-chat"></i>
                        Note
                    </button>
                    <div style="width: 200px;" class="collapse" id="collapse_{{$value['_id']}}">
                        <form class="note_form_{{$value['_id']}}">
                            @csrf
                            <div class="card">
                                <textarea name="note" class="form-control" aria-label="With textarea">{{$value['note'] ?? null}}</textarea>
                                <input type="hidden" name="mol_id" value="{{$value['_id']}}" />
                                <button type="button" data-id="{{$value['_id']}}" class="note_form_btn btn btn-light-success btn-sm">Submit</button>
                            </div>
                        </form>
                    </div>
                    <div class="collapse" id="collapse{{$value['_id']}}">
                        <textarea readonly cols="30" rows="10">
                            {!! json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) !!}
                        </textarea>
                    </div>
                </td>

            @elseif($column === 'SMILES')
                <td>
                    <canvas id="smiles_{{$value['_id']}}"></canvas><p class="fixed_smiles">{{$value['SMILES']}}</p>
                    <script>
                        var smilesDrawer = new SmilesDrawer.Drawer({width: 300, height: 150});
                        SmilesDrawer.parse('{{$value['SMILES']}}', function (tree) {
                            smilesDrawer.draw(tree, "smiles_{{$value['_id']}}", "light", false);
                        })
                    </script>
                </td>
            @else
                <td>
                    @if(array_key_exists($column, $value) && is_numeric($value[$column]))
                        {{number_format((float)$value[$column], 4, '.', '') ?? null}}
                    @else
                        {{$value[$column] ?? null}}
                    @endif
                </td>
            @endif
        @endforeach
            <td>
                <button class="btn btn-danger btn-flat btn-sm destroy_mol" data-id="{{$value['_id']}}"><i class="bi bi-trash"></i></button>
            </td>
    </tr>
@endforeach
<tr>
    <td colspan="10" align="center">
        {!! $data['result']->links('pagination::bootstrap-4') !!}
    </td>
    <input type="hidden" name="checked_rows" id="checked_rows" value="{{$data['selected'] ?? null}}" />

</tr>

import ast
import re
from pathlib import Path

SOURCE=Path('contracts/rule_weft.py').read_text(encoding='ascii')
TREE=ast.parse(SOURCE)

def test_exact_runtime_ascii_class_and_payable_metadata():
    assert SOURCE.startswith('# v0.3.0\n# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }')
    classes=[n for n in TREE.body if isinstance(n,ast.ClassDef) and any(ast.unparse(b)=='gl.contract.Contract' for b in n.bases)]
    assert len(classes)==1 and classes[0].name=='RuleWeftContract'
    writes={n.name:[ast.unparse(d) for d in n.decorator_list] for n in classes[0].body if isinstance(n,ast.FunctionDef) and any('gl.public.write' in ast.unparse(d) for d in n.decorator_list)}
    assert len(writes)==9 and writes['open_request']==['gl.public.write.payable']
    assert all(ds==['gl.public.write'] for name,ds in writes.items() if name!='open_request')

def test_no_unsafe_nondeterminism_or_wrong_eoa_boundary():
    assert 'gl.vm.run_nondet(' not in SOURCE and 'gl.chain.Account' not in SOURCE
    assert 'gl.vm.run_nondet_default(leader, validator)' in SOURCE
    assert '_Recipient(gl.message.sender_address).emit_transfer(value=amount)' in SOURCE
    assert SOURCE.index('self.credits[key] = 0')<SOURCE.index('_Recipient(gl.message.sender_address).emit_transfer')

def test_all_temporal_writes_guard_inside_their_own_entrypoint():
    cls=next(n for n in TREE.body if isinstance(n,ast.ClassDef) and n.name=='RuleWeftContract')
    methods={n.name:ast.unparse(n) for n in cls.body if isinstance(n,ast.FunctionDef)}
    for name in ['create_policy','submit_rule','ratify','cancel_policy','open_request','review_request','consume','recover']:
        assert '_now()' in methods[name],name
    assert '_now()' not in methods['withdraw']

def test_pinned_source_bytes_verified_before_semantic_prompt():
    fn=next(n for n in TREE.body if isinstance(n,ast.FunctionDef) and n.name=='_evaluate')
    text=ast.unparse(fn)
    assert text.index('hashlib.sha256(body).hexdigest()')<text.index('gl.nondet.exec_prompt')
    assert 'SOURCE_HASH' in text and 'SOURCE_URL' in text

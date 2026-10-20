import itertools
import json
import sys
import pytest
from test_lifecycle import T,GEN,WORDS,ready,purchase,snapshot,mock_review,outcome
from test_judgment import module_for

@pytest.mark.parametrize('offset',[-1,0,1])
def test_ratification_deadline_is_independent_of_phase(env,tx,offset):
    _,c,a=env;tx('create_policy',['p','Title',a[1],a[2],a[1],T+100,T+1000])
    for i,row in enumerate(WORDS):tx('submit_rule',['p',i,*row],actor=i)
    digest=json.loads(c.get_policy('p'))['digest'];before=snapshot(c)
    if offset<0:tx('ratify',['p',digest],time=T+100+offset)
    else:
        with pytest.raises(Exception,match='POLICY_CLOSED'):tx('ratify',['p',digest],time=T+100+offset)
        assert snapshot(c)==before

@pytest.mark.parametrize('offset',[-1,0,1])
def test_active_policy_expiry_blocks_purchase_without_phase_advance(env,tx,offset):
    _,c,_=env;digest=ready(env,tx);before=snapshot(c)
    # A future purchase window cannot fit when the active policy is expired.
    with pytest.raises(Exception,match='REQUEST_TIME'):
        tx('open_request',['r','p','Synthetic action',digest,T+11000],time=T+10000+offset,value=GEN)
    assert snapshot(c)==before

@pytest.mark.parametrize('delta',[59,60,61])
def test_request_lower_window_boundary(env,tx,delta):
    _,c,_=env;digest=ready(env,tx);before=snapshot(c)
    if delta<60:
        with pytest.raises(Exception,match='REQUEST_TIME'):tx('open_request',['r','p','Action',digest,T+delta],value=GEN)
        assert snapshot(c)==before
    else:tx('open_request',['r','p','Action',digest,T+delta],value=GEN)

@pytest.mark.parametrize('fault',['wrong_digest','wrong_version','wrong_policy','duplicate_id','issuer_payer'])
def test_purchase_binding_provenance_failures(env,tx,fault):
    _,c,_=env;digest=ready(env,tx);policy='p';actor=0
    if fault=='wrong_digest':digest='0'*64
    if fault=='wrong_version':digest='RuleWeftV2'+digest
    if fault=='wrong_policy':policy='unknown'
    if fault=='duplicate_id':tx('open_request',['r','p','Original',digest,T+1000],value=GEN)
    if fault=='issuer_payer':actor=1
    before=snapshot(c)
    with pytest.raises(Exception):tx('open_request',['r',policy,'Action',digest,T+1000],actor=actor,value=GEN)
    assert snapshot(c)==before

@pytest.mark.parametrize('method,args',[('submit_rule',['p',0,*WORDS[0]]),('ratify',['p','wrong']),('cancel_policy',['p']),('review_request',['r']),('consume',['r']),('recover',['r']),('withdraw',[])])
def test_all_nonpayable_paths_reject_attached_gen_before_mutation(env,tx,method,args):
    _,c,_=env;purchase(env,tx);before=snapshot(c)
    with pytest.raises(Exception,match='NONPAYABLE'):tx(method,args,value=GEN)
    assert snapshot(c)==before

@pytest.mark.parametrize('state',['DENIED','GRANTED','EXPIRED','USED'])
def test_closed_or_already_decided_request_cannot_review_again(env,tx,state):
    _,c,_=env;purchase(env,tx)
    if state=='EXPIRED':tx('recover',['r'],time=T+1000)
    else:
        mock_review(env,'DENIED' if state=='DENIED' else 'GRANTED');tx('review_request',['r'])
        if state=='USED':tx('consume',['r'])
    before=snapshot(c)
    with pytest.raises(Exception,match='REVIEW_STATE'):tx('review_request',['r'])
    assert snapshot(c)==before

@pytest.mark.parametrize('state',['OPEN','DENIED','EXPIRED'])
def test_consume_wrong_state_cannot_credit_issuer(env,tx,state):
    _,c,a=env;purchase(env,tx)
    if state=='EXPIRED':tx('recover',['r'],time=T+1000)
    if state=='DENIED':mock_review(env,'DENIED');tx('review_request',['r'])
    before=snapshot(c)
    with pytest.raises(Exception,match='CONSUME_STATE'):tx('consume',['r'])
    assert snapshot(c)==before and c.get_credit(a[1])=='0'

def test_attempt_history_is_append_only_and_bounded_with_expiry_exit(env,tx):
    _,c,_=env;purchase(env,tx);mock_review(env,'RETRYABLE')
    for n in range(1,6):
        tx('review_request',['r'])
        assert json.loads(c.get_attempt('r',n))['id']==f'r:{n}'
    before=snapshot(c)
    with pytest.raises(Exception,match='REVIEW_LIMIT'):tx('review_request',['r'])
    assert snapshot(c)==before
    tx('recover',['r'],time=T+1000)
    assert json.loads(c.get_accounting())['escrowGEN']=='0'

@pytest.mark.parametrize('source_fault',['digest','status','oversize'])
def test_hash_or_source_failure_never_calls_model_or_moves_value(env,tx,source_fault):
    vm,c,_=env;purchase(env,tx);m=mock_review(env)
    vm.clear_mocks()
    body='ODRL Information Model 2018 '+('x'*300001 if source_fault=='oversize' else 'x'*1000)
    vm.mock_web(r'.*',{'status':404 if source_fault=='status' else 200,'body':body})
    before=json.loads(c.get_accounting());tx('review_request',['r'])
    r=json.loads(c.get_request('r'))
    assert r['status']=='RETRYABLE' and r['reserveGEN']=='1'
    assert json.loads(c.get_accounting())==before
    assert not vm._llm_mocks_hit

def test_valid_hash_actor_hosted_copy_never_becomes_authority(env,tx,monkeypatch):
    _,c,_=env;purchase(env,tx);m=module_for(c)
    # Production accepts no URL or attestation parameter; only fixed source acquisition.
    import inspect
    assert 'url' not in inspect.signature(c.review_request).parameters
    assert m.SOURCE_URL=='https://www.w3.org/TR/2018/REC-odrl-model-20180215/'
    before=snapshot(c)
    with pytest.raises(Exception,match='REQUEST_PAYER'):tx('review_request',['r'],actor=1)
    assert snapshot(c)==before

def test_entity_isolation_and_wrong_full_slate_digest(env,tx):
    _,c,a=env;d=ready(env,tx);tx('create_policy',['q','Other policy',a[1],a[2],a[1],T+100,T+10000])
    for i,row in enumerate(WORDS):tx('submit_rule',['q',i,*row],actor=i)
    before=snapshot(c)
    with pytest.raises(Exception,match='POLICY_DIGEST'):tx('ratify',['q',d])
    assert snapshot(c)==before
    assert json.loads(c.get_policy('p'))['status']=='ACTIVE'
    assert json.loads(c.get_policy('q'))['status']=='RATIFYING'

def test_grounded_labels_match_characteristic_least_fixed_point_for_all_graphs(env,tx):
    _,c,_=env;m=module_for(c)
    pairs=[(i,j) for i in range(3) for j in range(3) if i!=j]
    # Production graph has at most one outgoing edge per source. Enumerate every
    # legal target choice and applicability set, against a separate Dung operator.
    cases=0
    for targets in itertools.product(*[[-1]+[j for j in range(3) if i!=j] for i in range(3)]):
        for mask in range(8):
            active={i for i in range(3) if mask&(1<<i)}
            edges=[(i,t) for i,t in enumerate(targets) if i in active and t in active]
            g=set()
            for _ in range(8):
                nxt={a for a in active if all(any((z,b) in edges for z in g) for b,k in edges if k==a)}
                if nxt==g:break
                g=nxt
            expected=['INACTIVE' if i not in active else 'IN' if i in g else 'OUT' if any((z,i) in edges for z in g) else 'UNDEC' for i in range(3)]
            rules=[{'id':f'R{i}','effect':'BLOCK' if i==1 else 'ALLOW','target':'' if t<0 else f'R{t}'} for i,t in enumerate(targets)]
            rows=[{'id':f'R{i}','applicability':'APPLIES' if i in active else 'NOT_APPLICABLE','exception':'OVERRIDES' if (i,targets[i]) in edges else 'NO_OVERRIDE'} for i in range(3)]
            actual,status=m._resolve(rows,rules)
            assert actual==expected
            if status=='GRANTED':assert expected[1] in ['OUT','INACTIVE'] and any(expected[i]=='IN' for i in [0,2])
            cases+=1
    assert cases==216

import json
import pytest
from conftest import context

T=1893456000
GEN=10**18
WORDS=[('ALLOW','Allow external publication of diagnostic logs.',''),('BLOCK','Prohibit external publication of diagnostic logs, overriding R0.','R0'),('ALLOW','As an exception to R1, allow entirely synthetic diagnostic logs with no customer information.','R1')]

def ready(env,tx,policy='p'):
    _,c,a=env
    tx('create_policy',[policy,'Shared diagnostics',a[1],a[2],a[1],T+100,T+10000])
    for i,(effect,text,target) in enumerate(WORDS):
        tx('submit_rule',[policy,i,effect,text,target],actor=i)
    digest=json.loads(c.get_policy(policy))['digest']
    for i in range(3):
        tx('ratify',[policy,digest],actor=i)
    return digest

def purchase(env,tx,request='r',deadline=T+1000):
    digest=ready(env,tx)
    tx('open_request',[request,'p','Publish entirely synthetic diagnostic logs.',digest,deadline],value=GEN)
    return digest

def outcome(c,kind='GRANTED'):
    r=json.loads(c.get_request('r'))
    app=['APPLIES']*3
    edge=['NO_OVERRIDE','OVERRIDES','OVERRIDES']
    if kind=='DENIED':
        app[2]='NOT_APPLICABLE';edge[2]='NO_OVERRIDE'
    if kind=='RETRYABLE':
        app[2]='UNCLEAR';edge[2]='UNCLEAR'
    return {'request_id':'r','policy_digest':r['policyDigest'],'rules':[{'id':f'R{i}','applicability':app[i],'exception':edge[i]} for i in range(3)],'reason':'Test semantics only.'}

def mock_review(env,kind='GRANTED'):
    vm,c,_=env
    import sys
    module=sys.modules[type(c._instance).__module__] if hasattr(c,'_instance') else None
    # Exact known source bytes are obtained from a deterministic local test body.
    # The contract's source pin is patched only within this direct test fixture.
    import hashlib
    body=b'ODRL Information Model 2018 '+b' vocabulary'*150
    if module is None:
        from gltest.direct import loader
        module=next(m for n,m in sys.modules.items() if n.startswith('contract_') and hasattr(m,'RuleWeftContract'))
    module.SOURCE_HASH=hashlib.sha256(body).hexdigest()
    vm.clear_mocks()
    vm.mock_web(r'.*www\.w3\.org.*',{'status':200,'body':body.decode()})
    vm.mock_llm(r'.*',json.dumps(outcome(c,kind)))
    return module

def snapshot(c):
    return c.get_accounting(),c.list_requests(),c.list_policies()

def test_full_policy_purchase_recovery_and_own_exit(env,tx):
    vm,c,a=env
    purchase(env,tx)
    assert json.loads(c.get_accounting())['escrowGEN']=='1'
    tx('recover',['r'],time=T+1000)
    assert json.loads(c.get_request('r'))['status']=='EXPIRED'
    assert c.get_credit(a[0])=='1'
    tx('withdraw')
    ledger=json.loads(c.get_accounting())
    assert ledger=={'receivedGEN':'1','escrowGEN':'0','creditGEN':'0','withdrawnGEN':'1','invariant':True}
    # Native delivery is proved separately by exact-balance network evidence.
    assert c.get_credit(a[0])=='0'

@pytest.mark.parametrize('actor',[1,2])
def test_recovery_wrong_caller_never_credits_or_changes_request(env,tx,actor):
    _,c,_=env;purchase(env,tx);before=snapshot(c)
    with pytest.raises(Exception,match='REQUEST_PAYER'):
        tx('recover',['r'],actor=actor,time=T+1000)
    assert snapshot(c)==before

@pytest.mark.parametrize('offset',[-1,0,1])
def test_recovery_boundary_with_stale_open_phase(env,tx,offset):
    _,c,_=env;purchase(env,tx);before=snapshot(c)
    if offset<0:
        with pytest.raises(Exception,match='RECOVERY_TIME'):
            tx('recover',['r'],time=T+1000+offset)
        assert snapshot(c)==before
    else:
        tx('recover',['r'],time=T+1000+offset)
        assert json.loads(c.get_request('r'))['status']=='EXPIRED'
        assert json.loads(c.get_accounting())['creditGEN']=='1'

def test_duplicate_recovery_and_withdraw_never_double_allocate(env,tx):
    _,c,_=env;purchase(env,tx);tx('recover',['r'],time=T+1000);before=snapshot(c)
    with pytest.raises(Exception,match='RECOVERY_STATE'):
        tx('recover',['r'],time=T+1001)
    assert snapshot(c)==before
    tx('withdraw');before=snapshot(c)
    with pytest.raises(Exception,match='NO_CREDIT'):
        tx('withdraw')
    assert snapshot(c)==before

@pytest.mark.parametrize('value',[0,2*GEN])
def test_exact_purchase_value_before_mutation(env,tx,value):
    _,c,_=env;digest=ready(env,tx);before=snapshot(c)
    with pytest.raises(Exception,match='EXACT_1_GEN'):
        tx('open_request',['r','p','Synthetic logs',digest,T+1000],value=value)
    assert snapshot(c)==before

def test_other_wallet_cannot_withdraw_payer_credit(env,tx):
    _,c,_=env;purchase(env,tx);tx('recover',['r'],time=T+1000);before=snapshot(c)
    with pytest.raises(Exception,match='NO_CREDIT'):
        tx('withdraw',actor=1)
    assert snapshot(c)==before

def test_immutable_rules_full_digest_and_all_author_assent(env,tx):
    _,c,a=env;digest=ready(env,tx)
    assert digest and json.loads(c.get_policy('p'))['status']=='ACTIVE'
    before=snapshot(c)
    with pytest.raises(Exception,match='RULE_STATE'):
        tx('submit_rule',['p',0,'ALLOW','Replacement text',''])
    with pytest.raises(Exception,match='RATIFY_STATE'):
        tx('ratify',['p',digest])
    assert snapshot(c)==before

def test_hash_valid_rule_by_wrong_author_is_rejected(env,tx):
    _,c,a=env;tx('create_policy',['p','Title',a[1],a[2],a[1],T+100,T+1000]);before=snapshot(c)
    with pytest.raises(Exception,match='RULE_AUTHOR'):
        tx('submit_rule',['p',1,*WORDS[1]])
    assert snapshot(c)==before

@pytest.mark.parametrize('offset',[-1,0,1])
def test_authoring_boundary_in_stale_collection(env,tx,offset):
    _,c,a=env;tx('create_policy',['p','Title',a[1],a[2],a[1],T+100,T+1000]);before=snapshot(c)
    if offset<0:
        tx('submit_rule',['p',0,*WORDS[0]],time=T+100+offset)
        assert json.loads(c.get_policy('p'))['rules'][0]['submitted']
    else:
        with pytest.raises(Exception,match='POLICY_CLOSED'):
            tx('submit_rule',['p',0,*WORDS[0]],time=T+100+offset)
        assert snapshot(c)==before

@pytest.mark.parametrize('actor',[1,2])
def test_cancel_expired_draft_requires_creator(env,tx,actor):
    _,c,a=env;tx('create_policy',['p','Title',a[1],a[2],a[1],T+100,T+1000]);before=snapshot(c)
    with pytest.raises(Exception,match='POLICY_CREATOR'):
        tx('cancel_policy',['p'],actor=actor,time=T+100)
    assert snapshot(c)==before

@pytest.mark.parametrize('offset',[-1,0,1])
def test_cancel_expiry_boundary_stale_phase(env,tx,offset):
    _,c,a=env;tx('create_policy',['p','Title',a[1],a[2],a[1],T+100,T+1000]);before=snapshot(c)
    if offset<0:
        with pytest.raises(Exception,match='CANCEL_TIME'):
            tx('cancel_policy',['p'],time=T+100+offset)
        assert snapshot(c)==before
    else:
        tx('cancel_policy',['p'],time=T+100+offset)
        assert json.loads(c.get_policy('p'))['status']=='CANCELLED'

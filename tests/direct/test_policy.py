import json
import pytest

T=1893456000

def test_valid_creation_isolated(env,tx):
    _,c,a=env
    tx('create_policy',['p','Release diagnostics',a[1],a[2],a[1],T+100,T+1000])
    p=json.loads(c.get_policy('p'))
    assert p['status']=='COLLECTING' and len(p['rules'])==3
    assert len({r['author'] for r in p['rules']})==3
    assert json.loads(c.get_accounting())['invariant']

@pytest.mark.parametrize('delta',[0,-1])
def test_creation_rejects_nonfuture_collection_before_any_state(env,tx,delta):
    _,c,a=env
    before=c.get_accounting()
    with pytest.raises(Exception,match='POLICY_TIME'):
        tx('create_policy',['late','Late collection',a[1],a[2],a[1],T+delta,T+1000])
    assert c.get_accounting()==before
    with pytest.raises(Exception,match='POLICY_NOT_FOUND'):
        c.get_policy('late')

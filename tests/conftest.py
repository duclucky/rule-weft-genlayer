"""Pinned SDK test transport adaptation; no application authorization is bypassed."""
import os
import tempfile
from pathlib import Path
from datetime import datetime, timezone
import pytest
from gltest.direct import loader, wasi_mock
from gltest.direct.vm import VMContext

# The v0.3 wire keeps JSON prompt responses as text in the ok envelope.
_llm = wasi_mock._handle_llm_request
def prompt_wire(vm, request):
    result = vm._match_llm_mock(request.get("prompt", ""))
    return {"ok": result} if result is not None else _llm(vm, request)
wasi_mock._handle_llm_request = prompt_wire

if os.name == "nt":
    _cleanup = VMContext._cleanup_after_deactivate
    def inject(vm):
        from genlayer import calldata
        from genlayer.types import Address
        raw = vm.get_message_raw()
        for key in ("contract_address", "sender_address", "origin_address"):
            if isinstance(raw[key], bytes):
                raw[key] = Address(raw[key])
        fd, path = tempfile.mkstemp()
        try:
            os.write(fd, calldata.encode(raw))
            os.lseek(fd, 0, os.SEEK_SET)
            vm._original_stdin_fd = os.dup(0)
            os.dup2(fd, 0)
            vm._ruleweft_stdin_file = path
        finally:
            os.close(fd)
    def cleanup(vm):
        try:
            _cleanup(vm)
        finally:
            path = getattr(vm, "_ruleweft_stdin_file", None)
            if path:
                os.unlink(path)
                vm._ruleweft_stdin_file = None
    loader._inject_message_to_fd0 = inject
    VMContext._cleanup_after_deactivate = cleanup

_load = loader._load_module
def fresh(path):
    import genlayer.contract as contract_api
    contract_api.__known_contract__ = None
    return _load(path)
loader._load_module = fresh

@pytest.fixture
def env(direct_vm, direct_alice, direct_bob, direct_charlie):
    vm = direct_vm
    vm._chain_id = 61997
    vm.warp("2030-01-01T00:00:00Z")
    vm.sender = direct_alice
    c = loader.deploy_contract(Path("contracts/rule_weft.py").resolve(), vm, sdk_version="v0.6.0-rc5")
    from genlayer.types import Address
    return vm, c, [Address(a) if isinstance(a, bytes) else a for a in (direct_alice, direct_bob, direct_charlie)]

def context(vm, sender, time, value=0):
    import genlayer as gl
    from genlayer.types import Address
    vm.sender = sender
    vm.value = value
    vm.warp(datetime.fromtimestamp(time, timezone.utc).isoformat())
    raw = vm.get_message_raw()
    for key in ("contract_address", "sender_address", "origin_address"):
        if isinstance(raw[key], bytes):
            raw[key] = Address(raw[key])
    # Pinned gltest's sender synchronization still assumes the v0.2 message type.
    # Refresh the v0.3 module/raw transaction context explicitly for every call.
    gl.message.raw = raw
    for key, value in raw.items():
        setattr(gl.message, key, value)

@pytest.fixture
def tx(env):
    vm, c, actors = env
    def call(method, args=(), actor=0, time=1893456000, value=0):
        context(vm, actors[actor], time, value)
        return getattr(c, method)(*args)
    return call

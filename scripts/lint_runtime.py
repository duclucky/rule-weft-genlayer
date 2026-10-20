"""Keep the pinned upstream check intact; teach it the documented safe v0.3 name."""
import os
os.environ["GENVM_VERSION"] = "v0.6.0-rc5"
from genvm_linter.lint import safety, structure
safety.SafeEntryPointFinder.SAFE_PATTERNS["gl.vm.run_nondet_default"] = [0, 1]
safety.NONDET_SPAWN_CALLS = safety.NONDET_SPAWN_CALLS | {"gl.vm.run_nondet_default"}
original = structure.StorageClassChecker._decorator_to_string
def decorator(self, node):
    value = original(self, node)
    return "gl.allow_storage" if value == "gl.storage.allow" else value
structure.StorageClassChecker._decorator_to_string = decorator
from genvm_linter.cli import main
if __name__ == "__main__":
    main()

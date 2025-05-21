#pragma version ^0.4.1

message: String[16]

@external
def store(_message: String[16]):
    self.message = _message

@view
@external
def retrieve() -> String[16]:
    return self.message

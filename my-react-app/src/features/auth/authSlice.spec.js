import authReducer, {
  setAutologin,
  login,
  logout,
  loadState,
} from './authSlice';

describe('auth reducer', () => {
  const initialState = {
    autologin: true,
    token: '',
    username: '',
    password: '',
    role: '',
    status: 'idle',
  };
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6InVzZXIxIiwicm9sZSI6InVzZXIifQ.IwvxenRrDlj8_4pXkEYWNMEpL_FcC8g1w0heLM_yw10";
  it('loadState autologin not set', ()=>{
    localStorage.removeItem("token");
    expect(loadState()).toEqual({
      autologin: true,
      token: '',
      username: '',
      password: '',
      role: '',
      status: 'idle',
    });
  });

  it('loadState autologin true', () => {
    localStorage.setItem("token", token );
    expect(loadState()).toEqual({
      autologin: true,
      token: token,
      username: "user1",
      password: '',
      role: 'user',
      status: 'idle',
    });
  });

  it('should handle initial state', () => {
    localStorage.removeItem("token", token );
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      autologin: true,
      token: '',
      username: '',
      password: '',
      role: '',
      status: 'idle',
    });
  });

  it('should handle logout', () => {
    const actual = authReducer(initialState, logout());
    expect(actual.username).toEqual('');
    expect(actual.token).toEqual('');
    expect(actual.role).toEqual('');
    expect(localStorage.getItem("token")).toEqual(null);
  });

  it('should handle login', () => {
    const user1 = {username:"user1", role:"user", token:"abcdef"};
    const actual = authReducer(initialState, login(user1));
    expect(actual.username).toEqual(user1.username);
    expect(actual.token).toEqual(user1.token);
    expect(actual.role).toEqual(user1.role);
  });
});

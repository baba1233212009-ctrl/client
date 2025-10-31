import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API = '/api';

function Login({onAuth}) {
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('Alice');
  const [register, setRegister] = useState(false);

  async function submit(e){
    e.preventDefault();
    if(register){
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('password', password);
      const res = await axios.post(API + '/auth/register', form);
      localStorage.setItem('token', res.data.token);
      onAuth(res.data.user);
    } else {
      const res = await axios.post(API + '/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      onAuth(res.data.user);
    }
  }

  return <div style={{padding:20}}>
    <h2>{register ? 'Register' : 'Login'}</h2>
    <form onSubmit={submit}>
      {register && <input placeholder='Name' value={name} onChange={e=>setName(e.target.value)} />}
      <div><input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div><input placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <button>{register ? 'Register' : 'Login'}</button>
    </form>
    <div style={{marginTop:10}}>
      <button onClick={()=>setRegister(s=>!s)}>{register ? 'Already have account? Login' : 'New? Register'}</button>
    </div>
  </div>
}

function ChatList({token, onOpenChat, socket}) {
  const [chats, setChats] = useState([]);
  useEffect(()=>{
    if(!token) return;
    axios.get(API+'/chats', { headers: { Authorization: 'Bearer '+token } }).then(r=>setChats(r.data));
  }, [token]);

  return <div>
    <h3>Chats</h3>
    <ul>
      {chats.map(c => {
        const other = c.participants.find(p=>p._id !== localStorage.getItem('userId')) || c.participants[0];
        return <li key={c._id} style={{cursor:'pointer'}} onClick={()=>onOpenChat(c)}>{other.name}</li>
      })}
    </ul>
  </div>
}

function ChatWindow({chat, token, socket}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  useEffect(()=>{
    if(!chat) return;
    axios.get(API+'/chats/'+chat._id+'/messages', { headers: { Authorization: 'Bearer '+token } }).then(r=>setMessages(r.data));
  }, [chat]);

  useEffect(()=>{
    if(!socket) return;
    const handler = (payload) => {
      if(payload.chatId === chat._id) setMessages(m=>[...m, { ...payload.message, from: payload.from }]);
      else setMessages(m=>m);
    };
    socket.on('chat:message', (payload) => {
      if(!chat) return;
      if(payload.chatId === chat._id) setMessages(m=>[...m, { text: payload.message.text, from: { name: payload.fromName }, createdAt: new Date().toISOString() }])
    });
    return ()=> socket.off('chat:message');
  }, [socket, chat]);

  async function send(){
    if(!text) return;
    // send to server API as well
    await axios.post(API + '/chats/' + chat._id + '/messages', { text }, { headers: { Authorization: 'Bearer '+token }});
    socket.emit('chat:message', { to: chat.participants.find(p=>p._id !== localStorage.getItem('userId'))._id, chatId: chat._id, message: { text }, fromName: localStorage.getItem('userName') });
    setText('');
  }

  return <div className="chat">
    <div className="header">{chat ? chat.participants.map(p=>p.name).join(', ') : 'Select chat'}</div>
    <div className="messages">
      {messages.map((m,i)=><div key={i} className={'message '+(m.from && m.from._id === localStorage.getItem('userId') ? 'me' : 'them')}>
        <div>{m.text}</div>
        <div className="small">{new Date(m.createdAt).toLocaleString()}</div>
      </div>)}
    </div>
    <div className="input">
      <input style={{flex:1}} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=> e.key==='Enter' && send()} />
      <button onClick={send}>Send</button>
    </div>
  </div>
}

export default function App(){
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(token){
      axios.get('/api/users/me', { headers: { Authorization: 'Bearer '+token } }).then(r=>{
        setUser(r.data);
        localStorage.setItem('userId', r.data._id);
        localStorage.setItem('userName', r.data.name);
      }).catch(()=>{ localStorage.removeItem('token'); });
    }
  }, []);

  useEffect(()=>{
    if(user){
      const s = io('/', { auth: { token: localStorage.getItem('token') } });
      setSocket(s);
      s.emit('user:online', user._id);
      return ()=> s.disconnect();
    }
  }, [user]);

  if(!user) return <Login onAuth={(u)=>setUser(u)} />;

  return <div className="app">
    <div className="sidebar">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <img src={user.avatar || 'https://via.placeholder.com/40'} width="40" height="40" style={{borderRadius:20}} />
        <div>
          <div>{user.name}</div>
          <div className="small">{user.status}</div>
        </div>
      </div>
      <ChatList token={localStorage.getItem('token')} onOpenChat={c=>setActiveChat(c)} socket={socket} />
    </div>
    <div style={{flex:1}}>
      <ChatWindow chat={activeChat} token={localStorage.getItem('token')} socket={socket} />
    </div>
  </div>
}

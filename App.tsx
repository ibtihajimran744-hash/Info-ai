

import React, { useState, useRef, useEffect } from 'react';

import { Message, ChatSession } from './types';

import { geminiService } from './services/geminiService';

import { INITIAL_SUGGESTIONS } from './constants';

import MessageItem from './components/MessageItem';



type View = 'login' | 'home' | 'schedule' | 'fees' | 'chat' | 'notifications' | 'profile' | 'subjectDetail' | 'admin';

type AdminSubView = 'dashboard' | 'students' | 'staff' | 'payments' | 'analytics' | 'announcements' | 'settings';

type UserPersona = 'Student' | 'Teacher' | 'Admin' | 'Parent';



interface SubjectInfo {

  title: string;

  room: string;

  instructor: string;

  attendance: string;

  grade: string;

  progress: number;

  syllabus: string[];

}



const SUBJECT_DATA: Record<string, SubjectInfo> = {

  'Math': {

    title: 'Advanced Mathematics',

    room: 'Room 301',

    instructor: 'Dr. Sarah Jenkins',

    attendance: '95%',

    grade: 'A',

    progress: 78,

    syllabus: ['Calculus III', 'Linear Algebra', 'Differential Equations', 'Probability Theory']

  },

  'Physics': {

    title: 'Quantum Physics',

    room: 'Lab B',

    instructor: 'Prof. Robert Vance',

    attendance: '88%',

    grade: 'B+',

    progress: 62,

    syllabus: ['Particle Physics', 'Wave Mechanics', 'Relativity', 'Thermodynamics']

  },

  'English': {

    title: 'Technical Writing',

    room: 'Auditorium 2',

    instructor: 'Ms. Clara Oswald',

    attendance: '100%',

    grade: 'A+',

    progress: 90,

    syllabus: ['Report Structures', 'Grammar & Syntax', 'Documentation', 'Public Speaking']

  },

  'History': {

    title: 'History of Computing',

    room: 'Room 102',

    instructor: 'Dr. Alistair Gordon',

    attendance: '82%',

    grade: 'B',

    progress: 45,

    syllabus: ['Early Calculators', 'The Turing Era', 'The Microprocessor Revolution', 'Web Evolution']

  },

  'Chemistry': {

    title: 'Organic Chemistry',

    room: 'Lab 4',

    instructor: 'Prof. Henry Wu',

    attendance: '91%',

    grade: 'A-',

    progress: 55,

    syllabus: ['Alkanes & Alkenes', 'Molecular Orbitals', 'Spectroscopy', 'Synthesis']

  }

};



const App: React.FC = () => {

  const [currentView, setCurrentView] = useState<View>('login');

  const [adminSubView, setAdminSubView] = useState<AdminSubView>('dashboard');

  const [persona, setPersona] = useState<UserPersona>('Student');

  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false); // For Teacher role

  const scrollRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    if (scrollRef.current) {

      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;

    }

  }, [messages, currentView, adminSubView]);



  const handleLogin = () => {

    if (persona === 'Admin') {

      setCurrentView('admin');

      setAdminSubView('dashboard');

    } else {

      setCurrentView('home');

    }

  };



  const handleSend = async (text: string = input) => {

    if (!text.trim() || isLoading) return;

    if (currentView !== 'chat') setCurrentView('chat');



    const userMessage: Message = {

      id: Date.now().toString(),

      role: 'user',

      content: text,

      timestamp: new Date(),

    };



    setMessages(prev => [...prev, userMessage]);

    setInput('');

    setIsLoading(true);



    const assistantMessageId = (Date.now() + 1).toString();

    const assistantMessage: Message = {

      id: assistantMessageId,

      role: 'assistant',

      content: '',

      timestamp: new Date(),

    };



    setMessages(prev => [...prev, assistantMessage]);



    try {

      let fullResponse = '';

      await geminiService.sendMessageStream(text, (chunk) => {

        fullResponse += chunk;

        setMessages(prev => 

          prev.map(msg => 

            msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg

          )

        );

      });

    } catch (error) {

      setMessages(prev => 

        prev.map(msg => 

          msg.id === assistantMessageId 

            ? { ...msg, content: "Protocol interruption. Re-engage secure link." } 

            : msg

        )

      );

    } finally {

      setIsLoading(false);

    }

  };



  const openSubjectDetail = (subjectKey: string) => {

    const info = SUBJECT_DATA[subjectKey] || SUBJECT_DATA['Math'];

    setSelectedSubject(info);

    setCurrentView('subjectDetail');

  };



  // Login Screen

  if (currentView === 'login') {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0F1219]">

        <div className="flex gap-6 mb-10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">

          {(['Student', 'Teacher', 'Admin', 'Parent'] as UserPersona[]).map((p) => (

            <button

              key={p}

              onClick={() => setPersona(p)}

              className={`pb-2 transition-all border-b-2 ${persona === p ? 'text-[#FF7A64] border-[#FF7A64]' : 'border-transparent hover:text-white'}`}

            >

              {p}

            </button>

          ))}

        </div>



        <div className="w-full max-w-md bg-[#1E2530] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl text-center">

          <h1 className="text-3xl font-bold text-white mb-1">Info.ai</h1>

          <p className="text-sm text-slate-400 mb-8 font-medium">Unlock Your Future as {persona}</p>

          

          <div className="space-y-4 mb-8">

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>

              </span>

              <input type="text" placeholder="Username" className="w-full bg-[#0F1219] border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-[#FF7A64] transition-all" />

            </div>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">

                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>

              </span>

              <input type="password" placeholder="Password" className="w-full bg-[#0F1219] border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 outline-none focus:border-[#FF7A64] transition-all" />

            </div>

          </div>



          <button 

            onClick={handleLogin}

            className="w-full py-5 bg-gradient-to-r from-[#FF7A64] to-[#FF5C4D] text-white rounded-3xl font-bold text-lg shadow-lg shadow-[#FF7A64]/20 hover:scale-[1.02] transition-transform active:scale-95 mb-6"

          >

            LOGIN

          </button>



          <div className="flex justify-between px-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">

            <button className="hover:text-white">Forgot Password?</button>

            <button className="hover:text-white">Create Account</button>

          </div>

        </div>

      </div>

    );

  }



  // Admin Dashboard Interface (Desktop/Tablet Layout as in Screenshots)

  if (currentView === 'admin') {

    return (

      <div className="h-screen bg-[#0F1219] text-white flex overflow-hidden">

        {/* Sidebar */}

        <aside className="w-64 bg-[#0F1219] border-r border-slate-800 flex flex-col shrink-0">

          <div className="p-8 flex items-center gap-3">

             <div className="w-10 h-10 bg-[#FF7A64] rounded-xl flex items-center justify-center text-white shadow-lg">

               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 16l-5 2.72-5-2.72v-3.45l5 2.73 5-2.73V16z"/></svg>

             </div>

             <div>

               <h1 className="text-xl font-bold tracking-tight">CampusHub</h1>

               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Management System</p>

             </div>

          </div>



          <nav className="flex-1 px-4 space-y-2 py-4">

            {(['dashboard', 'students', 'staff', 'payments', 'analytics', 'announcements', 'settings'] as AdminSubView[]).map((v) => (

              <button

                key={v}

                onClick={() => setAdminSubView(v)}

                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${

                  adminSubView === v 

                    ? 'bg-gradient-to-r from-[#FF7A64]/20 to-transparent text-[#FF7A64] border-l-4 border-[#FF7A64]' 

                    : 'text-slate-500 hover:text-white hover:bg-slate-800/30'

                }`}

              >

                <span className="capitalize">{v}</span>

              </button>

            ))}

          </nav>



          <div className="p-6">

            <button onClick={() => setCurrentView('login')} className="w-full flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-white text-sm font-bold">

              <span>Collapse</span>

            </button>

          </div>

        </aside>



        {/* Main Admin Content */}

        <main className="flex-1 overflow-y-auto bg-[#0F1219] flex flex-col">

          {/* Admin Header */}

          <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 bg-[#0F1219]/80 backdrop-blur-md sticky top-0 z-50">

            <div className="relative w-96">

              <input type="text" placeholder="Search bots, intents, records..." className="w-full bg-[#1E2530] border border-slate-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#FF7A64] transition-all" />

              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>

            </div>

            <div className="flex items-center gap-6">

              <div className="px-4 py-2 bg-[#1E2530] border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-400">

                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>

                Development

              </div>

              <button className="relative p-2 text-slate-400">

                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>

                <span className="absolute top-1 right-1 w-5 h-5 bg-[#FF7A64] border-2 border-[#0F1219] rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none">2</span>

              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">

                <div className="w-10 h-10 bg-gradient-to-tr from-[#FF7A64] to-[#FF5C4D] rounded-xl flex items-center justify-center font-bold text-white shadow-lg">I</div>

                <div className="text-right">

                  <p className="text-sm font-bold leading-none">Ibtihaj imran</p>

                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">admin</p>

                </div>

              </div>

            </div>

          </header>



          <div className="p-10 max-w-7xl mx-auto w-full space-y-10">

            {/* Admin Subview: Dashboard */}

            {adminSubView === 'dashboard' && (

              <>

                <div className="flex justify-between items-end">

                  <div>

                    <h2 className="text-3xl font-black tracking-tight">Dashboard</h2>

                    <p className="text-slate-500 text-sm mt-1">Today's overview and college operations</p>

                  </div>

                  <div className="flex gap-4">

                    <button className="px-6 py-3 bg-[#1E2530] border border-slate-800 rounded-2xl text-xs font-bold hover:border-slate-700 transition-all">Mark Attendance</button>

                    <button className="px-6 py-3 bg-[#FF7A64] rounded-2xl text-xs font-bold text-white shadow-lg shadow-[#FF7A64]/20">Send Notice</button>

                  </div>

                </div>



                <div className="grid grid-cols-4 gap-6">

                  {[

                    { label: "Students Present", val: "2,847", change: "+5.2%", up: true, icon: "👤" },

                    { label: "Students Absent", val: "153", change: "-2.1%", up: false, icon: "👥" },

                    { label: "Fees Collected Today", val: "₹2.4L", change: "+18.5%", up: true, icon: "₹" },

                    { label: "Ongoing Classes", val: "42", change: "Across all depts", up: true, icon: "⏰" }

                  ].map((stat, i) => (

                    <div key={i} className="bg-[#1E2530] border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">

                      <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#FF7A64]/5 rounded-full group-hover:scale-150 transition-transform"></div>

                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>

                      <div className="flex justify-between items-end">

                        <div>

                          <h4 className="text-4xl font-black mb-2">{stat.val}</h4>

                          <span className={`text-[11px] font-bold ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>

                            {stat.up ? '↗' : '↘'} {stat.change} from yesterday

                          </span>

                        </div>

                        <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">{stat.icon}</div>

                      </div>

                    </div>

                  ))}

                </div>



                <div className="grid grid-cols-3 gap-10 pt-10">

                  <div className="col-span-2 bg-[#1E2530] border border-slate-800 p-10 rounded-[3rem] shadow-xl">

                    <div className="flex justify-between items-center mb-10">

                       <h3 className="text-xl font-bold">Weekly Attendance</h3>

                       <div className="flex gap-4">

                         <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">

                           <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Present

                         </span>

                         <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">

                           <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Absent

                         </span>

                       </div>

                    </div>

                    {/* Mock Attendance Graph */}

                    <div className="h-64 flex items-end justify-between gap-4 px-4 relative">

                       <div className="absolute inset-0 border-b border-slate-800 flex flex-col justify-between py-2 text-[10px] text-slate-700 font-bold opacity-30">

                          <span>3000</span><span>2250</span><span>1500</span><span>750</span><span>0</span>

                       </div>

                       {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (

                         <div key={day} className="flex-1 flex flex-col items-center gap-2 z-10">

                            <div className="w-full h-40 bg-emerald-500/20 rounded-t-lg relative group overflow-hidden">

                               <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 transition-all duration-1000 h-[85%] group-hover:h-[90%]"></div>

                            </div>

                            <span className="text-[11px] font-bold text-slate-600 uppercase">{day}</span>

                         </div>

                       ))}

                    </div>

                  </div>



                  <div className="bg-[#1E2530] border border-slate-800 p-10 rounded-[3rem] shadow-xl">

                    <h3 className="text-xl font-bold mb-10">Department Distribution</h3>

                    <div className="space-y-6">

                      {[

                        { name: "Computer Science", val: "35%", color: "#FF7A64" },

                        { name: "Engineering", val: "30%", color: "#FFC107" },

                        { name: "Business", val: "20%", color: "#4CAF50" },

                        { name: "Arts & Science", val: "15%", color: "#2196F3" }

                      ].map((dept, i) => (

                        <div key={i} className="flex items-center justify-between">

                          <div className="flex items-center gap-4">

                             <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs">CS</div>

                             <span className="text-sm font-bold text-slate-300">{dept.name}</span>

                          </div>

                          <span className="text-sm font-black text-white">{dept.val}</span>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              </>

            )}



            {/* Admin Subview: Students */}

            {adminSubView === 'students' && (

              <>

                <div className="flex justify-between items-end">

                  <div>

                    <h2 className="text-3xl font-black tracking-tight">Student Management</h2>

                    <p className="text-slate-500 text-sm mt-1">Manage student records and attendance</p>

                  </div>

                  <button className="px-8 py-4 bg-[#FF7A64] rounded-2xl text-xs font-bold text-white shadow-lg">+ Add New Student</button>

                </div>



                <div className="flex gap-4 pt-4">

                   <div className="flex-1 relative">

                      <input type="text" placeholder="Search by name or roll number..." className="w-full bg-[#1E2530] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#FF7A64]" />

                      <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>

                   </div>

                   <div className="flex gap-2 bg-[#1E2530] p-1.5 rounded-2xl border border-slate-800">

                      {['All', 'Active', 'Inactive'].map(t => (

                        <button key={t} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${t === 'All' ? 'bg-[

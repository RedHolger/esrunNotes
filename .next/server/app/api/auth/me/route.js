"use strict";(()=>{var e={};e.id=788,e.ids=[788],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},19801:e=>{e.exports=require("os")},86624:e=>{e.exports=require("querystring")},74175:e=>{e.exports=require("tty")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},8678:e=>{e.exports=import("pg")},86737:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.r(t),r.d(t,{originalPathname:()=>E,patchFetch:()=>c,requestAsyncStorage:()=>T,routeModule:()=>p,serverHooks:()=>l,staticGenerationAsyncStorage:()=>d});var a=r(49303),n=r(88716),i=r(60670),o=r(90193),u=e([o]);o=(u.then?(await u)():u)[0];let p=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/auth/me/route",pathname:"/api/auth/me",filename:"route",bundlePath:"app/api/auth/me/route"},resolvedPagePath:"/Users/manuvashistha/Documents/esrunNotes/app/api/auth/me/route.ts",nextConfigOutput:"standalone",userland:o}),{requestAsyncStorage:T,staticGenerationAsyncStorage:d,serverHooks:l}=p,E="/api/auth/me/route";function c(){return(0,i.patchFetch)({serverHooks:l,staticGenerationAsyncStorage:d})}s()}catch(e){s(e)}})},90193:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.r(t),r.d(t,{GET:()=>u});var a=r(87070),n=r(90120),i=r(9487),o=e([i]);async function u(e){let t=new a.NextResponse,r=await (0,n.Gg)(e,t);if(!r?.user?.email)return a.NextResponse.json({error:"Not authenticated"},{status:401,headers:t.headers});await (0,i.D)();let s=(0,i.db)(),o=(await s.query("SELECT id,name,email,role FROM users WHERE lower(email)=lower($1) LIMIT 1",[r.user.email])).rows[0];if(!o){let e=`${Date.now()}-${Math.random().toString(16).slice(2)}`,t=r.user.name||r.user.nickname||"User",a="student";await s.query("INSERT INTO users(id,name,email,password_hash,role) VALUES($1,$2,$3,$4,$5)",[e,t,r.user.email,"",a]),o={id:e,name:t,email:r.user.email,role:a}}return a.NextResponse.json({id:o.id,name:o.name,email:o.email,role:o.role},{headers:t.headers})}i=(o.then?(await o)():o)[0],s()}catch(e){s(e)}})},90120:(e,t,r)=>{r.d(t,{D_:()=>a,Gg:()=>s});let{getSession:s,handleAuth:a,handleLogin:n,handleLogout:i,handleCallback:o,handleProfile:u,withApiAuthRequired:c,withPageAuthRequired:p}=(0,r(64099).initAuth0)({baseURL:process.env.AUTH0_BASE_URL||"http://localhost:3000",issuerBaseURL:process.env.AUTH0_ISSUER_BASE_URL||"https://dev-cfns55eqkszncm62.us.auth0.com",clientID:process.env.AUTH0_CLIENT_ID||"hXW3gRRvNSstCigBDfIdcpLBzQJfUo80",clientSecret:process.env.AUTH0_CLIENT_SECRET||"4FvtcTL76fE5TNxzieC_Ogf9rYhkB7mltdW9dtm-GQ_dQ94gwd401MmBAsATyRhR",secret:process.env.AUTH0_SECRET||"dev-secret-dev-secret-dev-secret-dev-secret!!"})},9487:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.d(t,{D:()=>o,db:()=>u});var a=r(8678),n=e([a]);a=(n.then?(await n)():n)[0];let c=null,p=!1;function i(){return c||(c=new a.Pool({connectionString:process.env.DATABASE_URL})),c}async function o(){if(p)return;let e=i();await e.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `),await e.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
  `),await e.query(`
    CREATE TABLE IF NOT EXISTS lectures (
      id TEXT PRIMARY KEY,
      title TEXT,
      subject_id TEXT REFERENCES subjects(id),
      created_at TIMESTAMPTZ NOT NULL,
      transcript TEXT,
      analysis JSONB,
      uploaded_by TEXT REFERENCES users(id)
    );
  `),p=!0}function u(){return i()}s()}catch(e){s(e)}})}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[276,972,92,99],()=>r(86737));module.exports=s})();
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { TopicAnalytics } from '../types';
import { TrendingUp, Brain, Clock, Target, Sparkles } from 'lucide-react';

interface AnalyticsSectionProps {
  analytics: TopicAnalytics[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function AnalyticsSection({ analytics }: AnalyticsSectionProps) {
  if (!analytics || analytics.length === 0) {
    return (
      <div className="p-8 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
        <p className="text-neutral-500 font-medium">No detailed analytics available yet. Start learning to see your performance breakdown!</p>
      </div>
    );
  }

  const performanceData = analytics.map(a => ({
    name: a.topic,
    score: a.performance,
    subject: a.subject,
    time: Math.round(a.timeSpent / 60) // minutes
  }));

  const subjectData = Array.from(
    analytics.reduce((acc, curr) => {
      const existing = acc.get(curr.subject) || { name: curr.subject, totalScore: 0, count: 0, totalTime: 0 };
      acc.set(curr.subject, {
        name: curr.subject,
        totalScore: existing.totalScore + curr.performance,
        count: existing.count + 1,
        totalTime: existing.totalTime + curr.timeSpent
      });
      return acc;
    }, new Map<string, { name: string, totalScore: number, count: number, totalTime: number }>())
  ).map(([_, val]) => ({
    name: val.name,
    avgScore: Math.round(val.totalScore / val.count),
    time: Math.round(val.totalTime / 60)
  }));

  const growthAreas = analytics.filter(a => a.performance < 70).sort((a, b) => a.performance - b.performance);

  const totalTime = analytics.reduce((acc, curr) => acc + curr.timeSpent, 0);
  const avgScore = analytics.reduce((acc, curr) => acc + curr.performance, 0) / analytics.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-2 text-indigo-600 mb-2 relative z-10">
              <TrendingUp size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest font-serif italic text-indigo-400">Accuracy</span>
            </div>
            <div className="text-3xl font-display font-black relative z-10">{Math.round(avgScore)}%</div>
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
               <TrendingUp size={80} />
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-2 text-violet-600 mb-2 relative z-10">
              <Clock size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest font-serif italic text-violet-400">Total Time</span>
            </div>
            <div className="text-3xl font-display font-black relative z-10">{Math.round(totalTime / 60)}m</div>
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
               <Clock size={80} />
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Brain size={18} />
              <span className="text-xs font-bold uppercase tracking-wider text-green-400">Topics Mastered</span>
            </div>
            <div className="text-3xl font-display font-black">{analytics.filter(a => a.performance > 80).length} / {analytics.length}</div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Target size={18} />
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Strengths</span>
            </div>
            <div className="text-3xl font-display font-black">{analytics.flatMap(a => a.strengths).length}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm">
          <h4 className="text-lg font-bold mb-1">Performance by Subject</h4>
          <p className="text-xs text-neutral-400 mb-6 font-serif italic">Average accuracy across subject areas</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="avgScore" name="Avg Accuracy %" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm">
          <h4 className="text-lg font-bold mb-1">Time Distribution</h4>
          <p className="text-xs text-neutral-400 mb-6 font-serif italic">Total minutes spent per topic</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="time"
                  nameKey="name"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
           <h4 className="text-lg font-bold mb-1">Growth Areas</h4>
           <p className="text-xs text-neutral-400 mb-6 font-serif italic">Priority topics to improve mastery</p>
           <div className="space-y-4">
              {growthAreas.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50">
                  <div>
                    <p className="font-bold text-neutral-800 text-sm">{a.topic}</p>
                    <p className="text-[10px] text-neutral-500 uppercase font-black">{a.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-orange-600 font-display">{a.performance}%</p>
                    <button className="text-[10px] font-bold text-indigo-600 underline">Review Now</button>
                  </div>
                </div>
              ))}
              {growthAreas.length === 0 && (
                <div className="p-8 text-center bg-green-50/30 rounded-3xl border border-dashed border-green-100">
                  <Sparkles size={24} className="mx-auto text-green-400 mb-2" />
                  <p className="text-green-700 text-sm font-medium italic font-serif">Excellent! You've mastered all current topics above 70%.</p>
                </div>
              )}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
           <h4 className="text-lg font-bold mb-1">Specific Learning Gaps</h4>
           <p className="text-xs text-neutral-400 mb-6 font-serif italic">AI identified conceptual weaknesses</p>
           <div className="flex flex-wrap gap-2">
              {analytics.flatMap(a => a.weaknesses).map((w, i) => (
                <span key={i} className="px-4 py-2 bg-neutral-50 text-neutral-600 rounded-xl text-xs font-bold border border-neutral-100">
                  {w}
                </span>
              ))}
              {analytics.flatMap(a => a.weaknesses).length === 0 && <p className="text-neutral-400 text-sm italic font-serif">No conceptual gaps detected yet.</p>}
           </div>
        </div>
      </div>
    </div>
  );
}

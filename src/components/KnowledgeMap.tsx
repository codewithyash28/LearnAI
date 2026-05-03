import React from 'react';
import { motion } from 'motion/react';
import { Brain, Star, Info, Target, Compass } from 'lucide-react';
import { cn } from '../lib/utils';

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'core' | 'prerequisite' | 'forward' | 'interdisciplinary';
  description: string;
  x: number;
  y: number;
}

export interface KnowledgeEdge {
  from: string;
  to: string;
}

interface KnowledgeMapProps {
  data: {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  };
  onNodeClick?: (node: KnowledgeNode) => void;
}

export default function KnowledgeMap({ data, onNodeClick }: KnowledgeMapProps) {
  const [selectedNode, setSelectedNode] = React.useState<KnowledgeNode | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'core': return <Target className="text-indigo-600" size={24} />;
      case 'prerequisite': return <Compass className="text-amber-500" size={20} />;
      case 'forward': return <Star className="text-emerald-500" size={20} />;
      default: return <Brain className="text-violet-500" size={20} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-indigo-100 border-indigo-200';
      case 'prerequisite': return 'bg-amber-100 border-amber-200';
      case 'forward': return 'bg-emerald-100 border-emerald-200';
      default: return 'bg-violet-100 border-violet-200';
    }
  };

  return (
    <div className="relative w-full h-[500px] bg-neutral-50/50 rounded-[3rem] border border-neutral-100 overflow-hidden cursor-grab active:cursor-grabbing shadow-inner">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        drag
        dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {data.edges.map((edge, i) => {
            const fromNode = data.nodes.find(n => n.id === edge.from);
            const toNode = data.nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            
            return (
              <motion.line
                key={i}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
                x1={`calc(50% + ${fromNode.x}px)`}
                y1={`calc(50% + ${fromNode.y}px)`}
                x2={`calc(50% + ${toNode.x}px)`}
                y2={`calc(50% + ${toNode.y}px)`}
                stroke="currentColor"
                strokeWidth="2"
                className="text-neutral-400"
              />
            );
          })}
        </svg>

        {data.nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            onClick={() => {
              setSelectedNode(node);
              onNodeClick?.(node);
            }}
            className={cn(
              "absolute p-1 rounded-full cursor-pointer shadow-lg transition-all border-2",
              getBgColor(node.type),
              selectedNode?.id === node.id ? "ring-4 ring-indigo-500/20 scale-110 shadow-indigo-100" : ""
            )}
            style={{ 
              left: `calc(50% + ${node.x}px)`, 
              top: `calc(50% + ${node.y}px)`,
              transform: 'translate(-50%, -50%)' 
            }}
          >
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm">
              {getIcon(node.type)}
            </div>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <p className={cn(
                "text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full shadow-sm",
                node.type === 'core' ? "bg-indigo-600 text-white" : "bg-white text-neutral-600 border border-neutral-100"
              )}>
                {node.label}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Info Panel Overlay */}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
        <div className="flex justify-between items-end">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-neutral-100 shadow-xl pointer-events-auto max-w-xs transition-all">
            {selectedNode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedNode.id}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-neutral-100 rounded-lg">
                    {getIcon(selectedNode.type)}
                  </div>
                  <h4 className="font-bold text-neutral-900">{selectedNode.label}</h4>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed italic font-serif">
                  {selectedNode.description}
                </p>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 text-neutral-400">
                <Info size={16} />
                <p className="text-[11px] font-bold">Select a concept node to explore connections</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="bg-neutral-900 text-white px-4 py-2 rounded-2xl text-[10px] font-bold shadow-xl border border-white/10 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Neural Galaxy Alpha
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';

const Rules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-8 select-none">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-500">游戏规则</h1>
            <button onClick={() => navigate('/')} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-bold text-white">
                返回大厅
            </button>
        </header>

        <div className="space-y-8 text-lg">
            <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4">简介</h2>
                <p>
                    骷髅王是一款类似于"升级"或"桥牌"的吃墩（Trick-taking）游戏。
                    游戏共进行 10 个回合。第 1 回合每人发 1 张牌，第 2 回合发 2 张，以此类推，直到第 10 回合发 10 张。
                </p>
                <p className="mt-2">
                    在每个回合开始前，所有玩家需要根据手牌，同时猜测自己这一轮能赢得几墩（Tricks）。
                    猜对得分，猜错扣分！
                </p>
            </section>

            <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4">牌型大小</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-green-400 mb-2">花色牌 (Suits)</h3>
                        <p className="mb-2">共有三种花色：鹦鹉(绿色)、地图(紫色)、宝箱(黄色)。</p>
                        <p>数值 1-14。同花色比大小，不同花色且非王牌时，先出者大。</p>
                        <div className="flex gap-2 mt-2">
                            <Card card={{id: 'demo1', type: 'suit', suit: 'parrot', value: 14}} size="sm" />
                            <Card card={{id: 'demo2', type: 'suit', suit: 'map', value: 7}} size="sm" />
                            <Card card={{id: 'demo3', type: 'suit', suit: 'treasure', value: 1}} size="sm" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 mb-2">王牌 (Jolly Roger)</h3>
                        <p className="mb-2">黑色骷髅旗是王牌花色。</p>
                        <p>它可以管住所有普通花色牌。</p>
                        <div className="flex gap-2 mt-2">
                            <Card card={{id: 'demo4', type: 'suit', suit: 'jolly_roger', value: 10}} size="sm" />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">特殊牌 (Special Cards)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex flex-col items-center">
                            <Card card={{id: 'demo_esc', type: 'special', specialType: 'escape', suit: 'none', value: 0}} size="sm" />
                            <span className="font-bold mt-1">撤退 (Escape)</span>
                            <span className="text-xs text-center">数值为0，总是输，除非全出撤退</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Card card={{id: 'demo_pir', type: 'special', specialType: 'pirate', suit: 'none', value: 0}} size="sm" />
                            <span className="font-bold mt-1 text-red-400">海盗 (Pirate)</span>
                            <span className="text-xs text-center">赢过所有花色和王牌</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Card card={{id: 'demo_sk', type: 'special', specialType: 'skull_king', suit: 'none', value: 0}} size="sm" />
                            <span className="font-bold mt-1 text-yellow-500">骷髅王</span>
                            <span className="text-xs text-center">最大的牌！但这能被美人鱼杀掉</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Card card={{id: 'demo_mer', type: 'special', specialType: 'mermaid', suit: 'none', value: 0}} size="sm" />
                            <span className="font-bold mt-1 text-cyan-400">美人鱼</span>
                            <span className="text-xs text-center">赢过花色和王牌，且能杀骷髅王</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Card card={{id: 'demo_tig', type: 'special', specialType: 'tigress', suit: 'none', value: 0}} size="sm" />
                            <span className="font-bold mt-1 text-orange-400">母老虎</span>
                            <span className="text-xs text-center">可当撤退或海盗出</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-slate-900 rounded border border-red-500/30">
                    <h3 className="text-lg font-bold text-red-400 mb-2">克制关系链</h3>
                    <p className="text-xl font-bold text-center">
                        美人鱼 {'>'} 骷髅王 {'>'} 海盗 {'>'} 美人鱼
                    </p>
                    <p className="text-center text-sm text-slate-400 mt-2">
                        (普通情况下：骷髅王 {'>'} 海盗 {'>'} 美人鱼/王牌 {'>'} 花色)
                    </p>
                </div>
            </section>

            <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4">计分规则</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><span className="text-green-400 font-bold">叫对分：</span> 赢得墩数 x 20 分。</li>
                    <li><span className="text-green-400 font-bold">叫 0 墩且成功：</span> 回合数 x 10 分。</li>
                    <li><span className="text-red-400 font-bold">叫错分：</span> 差值 x -10 分。</li>
                    <li><span className="text-red-400 font-bold">叫 0 墩失败：</span> 回合数 x -10 分。</li>
                </ul>
            </section>
        </div>
      </div>
    </div>
  );
};

export default Rules;

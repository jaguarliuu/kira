import React from 'react'

export default function Sidebar({ activeAgent, agents = [], onSelectAgent }) {
  return (
    <aside className="w-60 border-r border-gray-200 p-8">
      <div className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-4">
        Agents
      </div>

      {agents.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center">
          <p className="mb-2">No agents yet</p>
          <p className="text-xs">Add files to<br/>public/agents/{'{agent-name}'}/</p>
        </div>
      ) : (
        <div className="space-y-1">
          {agents.map(agent => (
            <div
              key={agent.name}
              onClick={() => onSelectAgent(agent.name)}
              className={`px-4 py-2 rounded cursor-pointer transition-colors ${
                activeAgent === agent.name
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">{agent.name}</div>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

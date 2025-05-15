"use client";
import React, { useState, JSX } from 'react';

interface JsonViewerProps {
  data: any;
  expandedDepth?: number;
}

export default function JsonViewer({ data, expandedDepth = 1 }: JsonViewerProps) {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  const isExpanded = (path: string): boolean => {
    return expandedPaths[path] !== undefined ? expandedPaths[path] : getDepth(path) <= expandedDepth;
  };

  const getDepth = (path: string): number => {
    return path.split('.').length;
  };

  const toggleExpanded = (path: string) => {
    setExpandedPaths({
      ...expandedPaths,
      [path]: !isExpanded(path),
    });
  };

  const renderValue = (value: any, path: string): JSX.Element => {
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (value === undefined) {
      return <span className="text-gray-500">undefined</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{value ? 'true' : 'false'}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }

      return (
        <div>
          <span 
            onClick={() => toggleExpanded(path)}
            className="cursor-pointer select-none"
          >
            {isExpanded(path) ? '▼' : '▶'} Array({value.length})
          </span>
          {isExpanded(path) && (
            <div className="pl-4 border-l border-gray-300">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-500">{index}: </span>
                  {renderValue(item, `${path}.${index}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-gray-500">{'{}'}</span>;
      }

      return (
        <div>
          <span 
            onClick={() => toggleExpanded(path)}
            className="cursor-pointer select-none"
          >
            {isExpanded(path) ? '▼' : '▶'} Object({keys.length})
          </span>
          {isExpanded(path) && (
            <div className="pl-4 border-l border-gray-300">
              {keys.map((key) => (
                <div key={key} className="my-1">
                  <span className="text-gray-700 font-medium">{key}: </span>
                  {renderValue(value[key], `${path}.${key}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="font-mono text-sm bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px]">
      {renderValue(data, 'root')}
    </div>
  );
}
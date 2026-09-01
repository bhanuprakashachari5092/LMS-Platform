import React, { useState, useRef, useEffect } from 'react';
import { PracticeChrome } from './PracticeChrome';

interface PodState {
  name: string;
  ready: string;
  status: 'Running' | 'Pending' | 'ContainerCreating' | 'Terminating';
  restarts: number;
  age: string;
  ip: string;
  node: string;
}

interface ServiceState {
  name: string;
  type: string;
  clusterIp: string;
  externalIp: string;
  ports: string;
  age: string;
}

interface DeploymentState {
  name: string;
  ready: string;
  upToDate: number;
  available: number;
  age: string;
}

const INITIAL_PODS: PodState[] = [
  { name: 'lms-frontend-7f9d8b74c5-9x8zk', ready: '1/1', status: 'Running', restarts: 0, age: '2d14h', ip: '10.244.1.15', node: 'worker-node-1' },
  { name: 'lms-frontend-7f9d8b74c5-mpq72', ready: '1/1', status: 'Running', restarts: 0, age: '2d14h', ip: '10.244.2.42', node: 'worker-node-2' },
  { name: 'lms-backend-api-56784d4b8f-kx4n2', ready: '1/1', status: 'Running', restarts: 1, age: '5d2h', ip: '10.244.1.18', node: 'worker-node-1' },
  { name: 'redis-cache-0', ready: '1/1', status: 'Running', restarts: 0, age: '12d', ip: '10.244.2.10', node: 'worker-node-2' },
  { name: 'postgres-db-statefulset-0', ready: '1/1', status: 'Running', restarts: 0, age: '15d', ip: '10.244.1.5', node: 'worker-node-1' },
];

const INITIAL_SERVICES: ServiceState[] = [
  { name: 'kubernetes', type: 'ClusterIP', clusterIp: '10.96.0.1', externalIp: '<none>', ports: '443/TCP', age: '15d' },
  { name: 'lms-frontend-svc', type: 'LoadBalancer', clusterIp: '10.102.45.180', externalIp: '34.120.55.92', ports: '80:31245/TCP', age: '2d14h' },
  { name: 'lms-backend-svc', type: 'ClusterIP', clusterIp: '10.98.112.50', externalIp: '<none>', ports: '5000/TCP', age: '5d2h' },
  { name: 'postgres-db', type: 'ClusterIP', clusterIp: '10.108.20.12', externalIp: '<none>', ports: '5432/TCP', age: '15d' },
];

const INITIAL_DEPLOYMENTS: DeploymentState[] = [
  { name: 'lms-frontend', ready: '2/2', upToDate: 2, available: 2, age: '2d14h' },
  { name: 'lms-backend-api', ready: '1/1', upToDate: 1, available: 1, age: '5d2h' },
];

export const KubernetesSimulator: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = 'Kubernetes (kubectl) Practice Simulator',
  description = 'Simulated Kubernetes cluster control plane. Execute realistic kubectl commands against mocked resources.',
}) => {
  const [pods, setPods] = useState<PodState[]>(INITIAL_PODS);
  const [services, setServices] = useState<ServiceState[]>(INITIAL_SERVICES);
  const [deployments, setDeployments] = useState<DeploymentState[]>(INITIAL_DEPLOYMENTS);
  const [commandInput, setCommandInput] = useState<string>('');
  const [history, setHistory] = useState<Array<{ id: string; cmd: string; output: React.ReactNode }>>([
    {
      id: 'welcome',
      cmd: '',
      output: (
        <div className="space-y-1 text-slate-300 font-mono text-xs">
          <p className="text-sky-400 font-bold">Kubernetes Control Plane v1.28.2 (Practice Simulator)</p>
          <p className="text-slate-400">Try running: <span className="text-amber-300 font-bold">kubectl get pods</span>, <span className="text-amber-300 font-bold">kubectl get services</span>, <span className="text-amber-300 font-bold">kubectl describe pod redis-cache-0</span>, or <span className="text-amber-300 font-bold">kubectl scale deployment lms-frontend --replicas=4</span>.</p>
        </div>
      ),
    },
  ]);
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = commandInput.trim();
    if (!raw) return;

    setCommandLog((prev) => [...prev, raw]);
    setHistoryPointer(-1);

    const parts = raw.split(' ').filter(Boolean);
    let output: React.ReactNode = null;

    if (parts[0] !== 'kubectl') {
      output = <div className="text-red-400 font-mono">Commands in this simulator must start with 'kubectl' (e.g. kubectl get pods)</div>;
    } else {
      const verb = parts[1];
      const resource = parts[2];
      const targetName = parts[3];

      switch (verb) {
        case 'get': {
          if (!resource || resource === 'pods' || resource === 'pod' || resource === 'po') {
            const isWide = parts.includes('-o') && parts.includes('wide');
            output = (
              <div className="font-mono text-xs text-slate-200 whitespace-pre">
                <div className="text-slate-400 font-bold">
                  {isWide
                    ? 'NAME                                    READY   STATUS    RESTARTS   AGE     IP            NODE'
                    : 'NAME                                    READY   STATUS    RESTARTS   AGE'}
                </div>
                {pods.map((p) => {
                  const padName = p.name.padEnd(38, ' ');
                  const padReady = p.ready.padEnd(7, ' ');
                  const padStatus = p.status.padEnd(9, ' ');
                  const padRestarts = String(p.restarts).padEnd(10, ' ');
                  const padAge = p.age.padEnd(7, ' ');
                  const padIp = p.ip.padEnd(13, ' ');
                  return (
                    <div key={p.name}>
                      <span className="text-slate-200">{padName}</span>
                      <span className="text-slate-300">{padReady}</span>
                      <span className={p.status === 'Running' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {padStatus}
                      </span>
                      <span className="text-slate-300">{padRestarts}</span>
                      <span className="text-slate-400">{padAge}</span>
                      {isWide && (
                        <>
                          <span className="text-sky-300">{padIp}</span>
                          <span className="text-slate-400">{p.node}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          } else if (resource === 'services' || resource === 'svc' || resource === 'service') {
            output = (
              <div className="font-mono text-xs text-slate-200 whitespace-pre">
                <div className="text-slate-400 font-bold">
                  NAME                TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
                </div>
                {services.map((s) => {
                  const padName = s.name.padEnd(19, ' ');
                  const padType = s.type.padEnd(14, ' ');
                  const padCluster = s.clusterIp.padEnd(15, ' ');
                  const padExt = s.externalIp.padEnd(15, ' ');
                  const padPorts = s.ports.padEnd(16, ' ');
                  return (
                    <div key={s.name}>
                      <span className="text-slate-200">{padName}</span>
                      <span className="text-sky-400">{padType}</span>
                      <span className="text-slate-300">{padCluster}</span>
                      <span className="text-emerald-400">{padExt}</span>
                      <span className="text-slate-300">{padPorts}</span>
                      <span className="text-slate-400">{s.age}</span>
                    </div>
                  );
                })}
              </div>
            );
          } else if (resource === 'deployments' || resource === 'deploy' || resource === 'deployment') {
            output = (
              <div className="font-mono text-xs text-slate-200 whitespace-pre">
                <div className="text-slate-400 font-bold">
                  NAME               READY   UP-TO-DATE   AVAILABLE   AGE
                </div>
                {deployments.map((d) => (
                  <div key={d.name}>
                    <span className="text-slate-200">{d.name.padEnd(18, ' ')}</span>
                    <span className="text-emerald-400 font-bold">{d.ready.padEnd(7, ' ')}</span>
                    <span className="text-slate-300">{String(d.upToDate).padEnd(12, ' ')}</span>
                    <span className="text-slate-300">{String(d.available).padEnd(11, ' ')}</span>
                    <span className="text-slate-400">{d.age}</span>
                  </div>
                ))}
              </div>
            );
          } else if (resource === 'nodes' || resource === 'node' || resource === 'no') {
            output = (
              <div className="font-mono text-xs text-slate-200 whitespace-pre">
                <div className="text-slate-400 font-bold">
                  NAME             STATUS   ROLES           AGE   VERSION
                </div>
                <div>control-plane  <span className="text-emerald-400 font-bold">Ready</span>    control-plane   15d   v1.28.2</div>
                <div>worker-node-1  <span className="text-emerald-400 font-bold">Ready</span>    &lt;none&gt;          15d   v1.28.2</div>
                <div>worker-node-2  <span className="text-emerald-400 font-bold">Ready</span>    &lt;none&gt;          15d   v1.28.2</div>
              </div>
            );
          } else {
            output = <div className="text-red-400 font-mono">error: the server doesn't have a resource type "{resource}"</div>;
          }
          break;
        }

        case 'describe': {
          const pod = pods.find((p) => p.name.includes(targetName || resource));
          if (!pod) {
            output = <div className="text-red-400 font-mono">Error from server (NotFound): pods "{targetName || resource}" not found</div>;
          } else {
            output = (
              <div className="font-mono text-xs text-slate-300 space-y-1">
                <div><strong className="text-sky-400">Name:</strong>         {pod.name}</div>
                <div><strong className="text-sky-400">Namespace:</strong>    default</div>
                <div><strong className="text-sky-400">Node:</strong>         {pod.node}/192.168.1.101</div>
                <div><strong className="text-sky-400">Status:</strong>       <span className="text-emerald-400 font-bold">{pod.status}</span></div>
                <div><strong className="text-sky-400">IP:</strong>           {pod.ip}</div>
                <div><strong className="text-sky-400">Containers:</strong></div>
                <div className="pl-4 text-slate-400">app-container:</div>
                <div className="pl-8 text-slate-400">Image:      kaizenq/app:v2.4.0</div>
                <div className="pl-8 text-slate-400">State:      {pod.status}</div>
                <div className="pl-8 text-slate-400">Ready:      True</div>
                <div className="pl-8 text-slate-400">Restart Count: {pod.restarts}</div>
              </div>
            );
          }
          break;
        }

        case 'logs': {
          const target = resource;
          if (!target) {
            output = <div className="text-red-400 font-mono">error: pod name required for kubectl logs</div>;
          } else {
            output = (
              <div className="font-mono text-xs text-slate-300 space-y-0.5">
                <div className="text-slate-500">2026-09-01T10:00:00.104Z [INFO] Initializing application framework...</div>
                <div className="text-slate-500">2026-09-01T10:00:01.420Z [INFO] Connected to PostgreSQL at postgres-db:5432</div>
                <div className="text-slate-500">2026-09-01T10:00:01.590Z [INFO] Cache cluster connected: redis-cache-0</div>
                <div className="text-emerald-400 font-bold">2026-09-01T10:00:02.000Z [INFO] HTTP Server listening on port 8080 (Ready for traffic)</div>
              </div>
            );
          }
          break;
        }

        case 'scale': {
          const replicaArg = parts.find((p) => p.startsWith('--replicas='));
          const count = replicaArg ? parseInt(replicaArg.split('=')[1], 10) : 3;
          if (resource === 'deployment' || resource === 'deploy') {
            const depName = targetName;
            setDeployments((prev) =>
              prev.map((d) => (d.name === depName ? { ...d, ready: `${count}/${count}`, available: count, upToDate: count } : d))
            );
            output = <div className="text-emerald-400 font-mono">deployment.apps/{depName} scaled to {count} replicas</div>;
          } else {
            output = <div className="text-red-400 font-mono">error: specify deployment to scale (e.g. kubectl scale deployment lms-frontend --replicas=3)</div>;
          }
          break;
        }

        case 'cluster-info': {
          output = (
            <div className="font-mono text-xs text-slate-300 space-y-1">
              <div>Kubernetes control plane is running at <span className="text-sky-400">https://192.168.49.2:8443</span></div>
              <div>CoreDNS is running at <span className="text-sky-400">https://192.168.49.2:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy</span></div>
            </div>
          );
          break;
        }

        default:
          output = <div className="text-red-400 font-mono">kubectl: unknown command "{verb}". Try 'kubectl get pods', 'kubectl get services'</div>;
          break;
      }
    }

    setHistory((prev) => [
      ...prev,
      {
        id: `k8s_${Date.now()}`,
        cmd: raw,
        output,
      },
    ]);
    setCommandInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandLog.length > 0) {
        const nextIdx = historyPointer === -1 ? commandLog.length - 1 : Math.max(0, historyPointer - 1);
        setHistoryPointer(nextIdx);
        setCommandInput(commandLog[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer !== -1) {
        const nextIdx = historyPointer + 1;
        if (nextIdx >= commandLog.length) {
          setHistoryPointer(-1);
          setCommandInput('');
        } else {
          setHistoryPointer(nextIdx);
          setCommandInput(commandLog[nextIdx] || '');
        }
      }
    }
  };

  const handleReset = () => {
    setPods(INITIAL_PODS);
    setServices(INITIAL_SERVICES);
    setDeployments(INITIAL_DEPLOYMENTS);
    setHistory([
      {
        id: 'reset',
        cmd: '',
        output: <div className="text-slate-400">Mock Kubernetes cluster reset to base state.</div>,
      },
    ]);
  };

  return (
    <PracticeChrome
      title={title}
      tabLabel="kubectl — default-cluster"
      badgeText="K8s Simulator"
      badgeColor="blue"
      description={description}
      onReset={handleReset}
      isMaximized={isMaximized}
      onToggleMaximize={() => setIsMaximized(!isMaximized)}
    >
      {/* ── Terminal Output Window ───────────────────────────────────────────── */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="p-4 sm:p-5 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm min-h-[280px] max-h-[440px] overflow-y-auto cursor-text space-y-3"
      >
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.cmd && (
              <div className="flex items-center gap-2 text-slate-200">
                <span className="text-sky-400 font-bold">student@k8s-cluster</span>
                <span className="text-slate-500">:</span>
                <span className="text-slate-400">$</span>
                <span className="text-slate-100 font-semibold">{item.cmd}</span>
              </div>
            )}
            {item.output && <div className="pl-0 sm:pl-2">{item.output}</div>}
          </div>
        ))}

        {/* Active Command Input Line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-1">
          <span className="text-sky-400 font-bold">student@k8s-cluster</span>
          <span className="text-slate-500">:</span>
          <span className="text-slate-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs sm:text-sm caret-sky-400"
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            placeholder="kubectl get pods, kubectl get services..."
          />
        </form>

        <div ref={terminalEndRef} />
      </div>
    </PracticeChrome>
  );
};

export default KubernetesSimulator;

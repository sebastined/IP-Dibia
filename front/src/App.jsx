// App.jsx
import { useState } from 'react'
import './App.css'

function App() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      // ✅ Directly target backend port
      const res = await fetch('https://ip-dibia.int.sebastine.ng/api/visit-report')
      if (!res.ok) throw new Error('Failed to fetch report')
      const data = await res.json()
      setReport(data)
    } catch (err) {
      console.error(err)
      alert('Failed to fetch report')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">IP-Dibia</h1>

      <button
        onClick={fetchReport}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl mb-6 transition-all duration-200 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Iju ese'}
      </button>

      {report && (
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-center">IP Report</h2>

          <table className="w-full border-collapse border border-gray-700 text-sm">
            <tbody>
              {Object.entries({
                IP: report.ip,
                Country: report.country,
                Region: report.region,
                City: report.city,
                Organization: report.org,
                'Abuse Confidence': report.abuseConfidence,
                'IPQS Fraud Score': report.ipqs_fraud_score,
                Proxy: report.proxy ? '✅ Yes' : '❌ No',
                VPN: report.vpn ? '✅ Yes' : '❌ No',
                TOR: report.tor ? '✅ Yes' : '❌ No',
                'Risk Score': report.riskScore,
                Summary: report.summary,
              }).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="py-2 px-4 font-semibold text-gray-300 w-1/3">{key}</td>
                  <td className="py-2 px-4">{value ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default App

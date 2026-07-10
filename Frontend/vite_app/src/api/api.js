const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const tryFetchJson = async (path, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  return response.json();
};

const tryFetchJsonMethod = async (method, path, body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  return response.json();
};

const normalizeCalls = (calls) => {
  return (calls || []).map((call) => {
    const insights = call.aiInsights || {};
    return {
      ...call,
      callId: call.callId || call._id,
      callTitle: call.callTitle || call.call_title || insights.callTitle || "Sales Call",
      callType: call.callType || call.call_type || insights.callType || "other",
      productName: call.productName || call.product_name || insights.productName || "Product",
      summary: call.summary || insights.summary || "No summary available.",
      sentiment: (call.sentiment || insights.sentiment || "neutral").toLowerCase(),
      dealProbability: call.dealProbability ?? insights.dealProbability ?? 0,
      createdAt: call.createdAt || call.created_at,
      aiInsights: {
        ...insights,
        objections: insights.objections || [],
        buyingSignals: insights.buyingSignals || [],
        improvementsNeeded: insights.improvementsNeeded || [],
      },
    };
  });
};

export const dashboardApi = {
  getCalls: async (token = null) => {
    try {
      const data = await tryFetchJson("/dashboard/calls", token);
      return { calls: normalizeCalls(data.calls || data.data || []) };
    } catch {
      return { calls: [] };
    }
  },

  getCallDetails: async (callId, token = null) => {
    try {
      const data = await tryFetchJson(`/dashboard/call/${callId}`, token);
      return { call: data.call || data.data };
    } catch {
      return { call: null };
    }
  },

  getCompetitors: async (token = null) => {
    try {
      const data = await tryFetchJson("/dashboard/competitors", token);
      return {
        competitorInsights:
          data.competitorInsights || data.data || { competitorsFrequency: [], topAdvantages: [] },
      };
    } catch {
      return { competitorInsights: { competitorsFrequency: [], topAdvantages: [] } };
    }
  },

  getProductAnalysis: async (productName, token = null) => {
    try {
      const data = await tryFetchJson(`/dashboard/product?product_name=${encodeURIComponent(productName)}`, token);
      return { calls: normalizeCalls(data.calls || data.data || []) };
    } catch {
      return { calls: [] };
    }
  },

  getAnalytics: async (token = null) => {
    try {
      const data = await tryFetchJson("/dashboard/analytics", token);
      return { analytics: data.analytics || data.data };
    } catch {
      return { analytics: null };
    }
  },
  downloadCallReport: async (callId, token = null) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/dashboard/report/${callId}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    const contentDisposition = response.headers.get('content-disposition') || '';
    const fileNameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
    const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1].replace(/"/g, '').trim()) : `call-report-${callId}.pdf`;
    const blob = await response.blob();

    return { blob, fileName };
  },

  getRiskRadar: async (token = null) => {
    try {
      const data = await tryFetchJson("/dashboard/risk-radar", token);
      return { riskCalls: data.riskCalls || [] };
    } catch {
      return { riskCalls: [] };
    }
  },
};

export const usersApi = {
  getEmployees: async (token) => {
    try {
      const data = await tryFetchJson("/users/employees", token);
      return { employees: data.data || [] };
    } catch {
      return { employees: [] };
    }
  },

  addEmployee: async (employeeData, token) => {
    return await tryFetchJsonMethod("POST", "/users/employees", employeeData, token);
  }
};

export const productsApi = {
  getProducts: async (token) => {
    try {
      const data = await tryFetchJson("/products", token);
      return { products: data.data || [] };
    } catch {
      return { products: [] };
    }
  },

  addProduct: async (productData, token) => {
    return await tryFetchJsonMethod("POST", "/products", productData, token);
  }
};

export const productIntelligenceApi = {
  getOverview: async (token) => {
    try {
      const data = await tryFetchJson("/product-intelligence/overview", token);
      return { products: data.products || [] };
    } catch {
      return { products: [] };
    }
  },

  getProductIntelligence: async (productId, token) => {
    try {
      const data = await tryFetchJson(`/product-intelligence/${productId}`, token);
      return data;
    } catch {
      return null;
    }
  },
};

export const employeeIntelligenceApi = {
  getOverview: async (token) => {
    try {
      const data = await tryFetchJson("/employee-intelligence/overview", token);
      return { employees: data.employees || [] };
    } catch {
      return { employees: [] };
    }
  },

  getEmployeeIntelligence: async (employeeId, token) => {
    try {
      const data = await tryFetchJson(`/employee-intelligence/${employeeId}`, token);
      return data;
    } catch {
      return null;
    }
  },
};

export const aiApi = {
  sendAnalysisEmail: async (callId, payload = {}, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/ai/send-email/${callId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || 'Failed to send email');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },
};
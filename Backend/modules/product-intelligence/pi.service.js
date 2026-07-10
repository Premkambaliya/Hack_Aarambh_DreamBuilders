import CallModel from "../audio/audio.model.js";
import ProductModel from "../products/product.model.js";

/**
 * Product Intelligence Service
 * Aggregates call-level AI insights into product-level intelligence.
 */

// ── helpers ──
const countMap = (arr) => {
  const map = {};
  (arr || []).forEach((item) => {
    const key = String(item || "").trim();
    if (key) map[key] = (map[key] || 0) + 1;
  });
  return map;
};

const sortedEntries = (map, limit = 15) =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text, count]) => ({ text, count }));

const mergeMap = (target, source) => {
  for (const [key, val] of Object.entries(source)) {
    target[key] = (target[key] || 0) + val;
  }
};

// ── Get overview of ALL products for a company ──
export const getProductOverview = async (companyId) => {
  // 1. Get all products for the company
  const products = await ProductModel.findByCompanyId(companyId);

  // 2. Get all analyzed calls for the company
  const calls = await CallModel.findAll({ companyId, status: "analyzed" });

  // 3. Build a map: productName → [calls]
  const productCallMap = {};
  products.forEach((p) => {
    productCallMap[p.productName.toLowerCase().trim()] = {
      product: p,
      calls: [],
    };
  });

  // Match calls to products by productId OR product_name match
  calls.forEach((call) => {
    const ins = call.aiInsights || {};
    const callProductName = (
      call.product_name ||
      ins.productName ||
      ""
    ).toLowerCase().trim();

    // Try matching by productId first
    if (call.productId) {
      const matched = products.find(
        (p) => p._id.toString() === call.productId
      );
      if (matched) {
        const key = matched.productName.toLowerCase().trim();
        if (productCallMap[key]) {
          productCallMap[key].calls.push(call);
          return;
        }
      }
    }

    // Fallback: match by name
    if (callProductName && productCallMap[callProductName]) {
      productCallMap[callProductName].calls.push(call);
      return;
    }

    // Partial match
    for (const key of Object.keys(productCallMap)) {
      if (callProductName.includes(key) || key.includes(callProductName)) {
        productCallMap[key].calls.push(call);
        return;
      }
    }
  });

  // 4. Compute summary for each product
  const overview = Object.values(productCallMap).map(({ product, calls: pCalls }) => {
    const total = pCalls.length;
    let posCount = 0, negCount = 0, neuCount = 0, probSum = 0;

    pCalls.forEach((c) => {
      const ins = c.aiInsights || {};
      const s = (ins.sentiment || "neutral").toLowerCase();
      if (s === "positive") posCount++;
      else if (s === "negative") negCount++;
      else neuCount++;
      probSum += ins.dealProbability || 0;
    });

    let dominantSentiment = "neutral";
    if (posCount >= negCount && posCount >= neuCount) dominantSentiment = "positive";
    else if (negCount > posCount && negCount > neuCount) dominantSentiment = "negative";

    return {
      productId: product._id.toString(),
      productName: product.productName,
      category: product.category || "General",
      description: product.description || "",
      totalCalls: total,
      sentiment: {
        positive: posCount,
        negative: negCount,
        neutral: neuCount,
        dominant: dominantSentiment,
      },
      avgDealProbability: total > 0 ? Math.round(probSum / total) : 0,
    };
  });

  return overview;
};

// ── Get deep intelligence for ONE product ──
export const getProductIntelligence = async (companyId, productId) => {
  // 1. Get the product
  const product = await ProductModel.findById(productId);
  if (!product) throw new Error("Product not found");
  if (product.companyId !== companyId) throw new Error("Access denied");

  const productName = product.productName.toLowerCase().trim();

  // 2. Get all analyzed calls
  const allCalls = await CallModel.findAll({ companyId, status: "analyzed" });

  // 3. Filter calls related to this product (by productId or name match)
  const relatedCalls = allCalls.filter((call) => {
    if (call.productId === productId) return true;
    const callProdName = (
      call.product_name ||
      call.aiInsights?.productName ||
      ""
    ).toLowerCase().trim();
    return (
      callProdName === productName ||
      callProdName.includes(productName) ||
      productName.includes(callProdName)
    );
  });

  // 4. Aggregate intelligence
  const objections = {};
  const buyingSignals = {};
  const positivePoints = {};
  const improvements = {};
  const competitors = {};
  const competitorAdvantages = {};
  const callTypes = {};

  let sentimentPos = 0, sentimentNeg = 0, sentimentNeu = 0;
  let totalProb = 0;
  let totalRepRating = 0;
  let repRatedCount = 0;
  let totalEngagement = 0;
  let engagedCount = 0;

  const recentCalls = [];

  relatedCalls.forEach((call) => {
    const ins = call.aiInsights || {};

    // Objections
    mergeMap(objections, countMap(ins.objections));

    // Buying signals
    mergeMap(buyingSignals, countMap(ins.buyingSignals));

    // Positive points
    mergeMap(positivePoints, countMap(ins.positivePoints));

    // Improvements needed
    mergeMap(improvements, countMap(ins.improvementsNeeded));

    // Competitors
    mergeMap(competitors, countMap(ins.competitors));
    mergeMap(competitorAdvantages, countMap(ins.competitorAdvantages));

    // Call types
    const ct = (call.call_type || ins.callType || "other").toLowerCase();
    callTypes[ct] = (callTypes[ct] || 0) + 1;

    // Sentiment
    const sentiment = (ins.sentiment || "neutral").toLowerCase();
    if (sentiment === "positive") sentimentPos++;
    else if (sentiment === "negative") sentimentNeg++;
    else sentimentNeu++;

    // Probability
    totalProb += ins.dealProbability || 0;

    // Rating (Rep performance)
    const rating =
      call.salesperson_rating || ins.salespersonPerformance?.rating;
    if (rating) {
      totalRepRating += Number(rating);
      repRatedCount++;
    }

    // Engagement
    const eng =
      call.customer_engagement ||
      ins.conversationAnalysis?.customerEngagementScore;
    if (eng) {
      totalEngagement += Number(eng);
      engagedCount++;
    }

    // Recent calls
    recentCalls.push({
      callId: call.callId,
      callTitle:
        call.call_title || ins.callTitle || ins.productName || "Untitled Call",
      sentiment: ins.sentiment || "neutral",
      dealProbability: ins.dealProbability || 0,
      customerName:
        call.customer_name || ins.customer?.name || "Unknown",
      employeeName: call.employeeName || "Unknown",
      callType: call.call_type || ins.callType || "other",
      createdAt: call.createdAt,
    });
  });

  // Sort recent calls by date
  recentCalls.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalCalls = relatedCalls.length;

  let dominantSentiment = "neutral";
  if (sentimentPos >= sentimentNeg && sentimentPos >= sentimentNeu)
    dominantSentiment = "positive";
  else if (sentimentNeg > sentimentPos && sentimentNeg > sentimentNeu)
    dominantSentiment = "negative";

  // Calculate Overall Product Rating (Out of 10) based on sentiment proportions
  let overallProductRating = 0;
  if (totalCalls > 0) {
    // Math: Positive = 10, Neutral = 6, Negative = 2
    const totalScoreMap = (sentimentPos * 10) + (sentimentNeu * 6) + (sentimentNeg * 2);
    overallProductRating = totalScoreMap / totalCalls;
  }

  return {
    product: {
      productId: product._id.toString(),
      productName: product.productName,
      category: product.category || "General",
      description: product.description || "",
    },
    summary: {
      totalCalls,
      avgDealProbability:
        totalCalls > 0 ? Math.round(totalProb / totalCalls) : 0,
      avgRepRating:
        repRatedCount > 0
          ? Math.round((totalRepRating / repRatedCount) * 10) / 10
          : 0,
      overallProductRating: totalCalls > 0 ? Math.round(overallProductRating * 10) / 10 : 0,
      avgCustomerEngagement:
        engagedCount > 0
          ? Math.round((totalEngagement / engagedCount) * 10) / 10
          : 0,
      sentiment: {
        positive: sentimentPos,
        negative: sentimentNeg,
        neutral: sentimentNeu,
        dominant: dominantSentiment,
      },
      callTypeDistribution: Object.entries(callTypes)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count })),
    },
    insights: {
      topObjections: sortedEntries(objections),
      topBuyingSignals: sortedEntries(buyingSignals),
      topPositivePoints: sortedEntries(positivePoints),
      topImprovements: sortedEntries(improvements),
      topCompetitors: sortedEntries(competitors),
      competitorAdvantages: sortedEntries(competitorAdvantages),
    },
    recentCalls: recentCalls.slice(0, 10),
  };
};

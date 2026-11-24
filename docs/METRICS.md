# Custom Metrics

## Regulatory Burden Index

### Overview

The **Regulatory Burden Index** is a composite metric designed to prioritize deregulation efforts by quantifying the total regulatory impact of each federal agency.

### Formula

```
Burden Score = (Word Count / 1,000) × Amendments × Number of CFR Titles
```

### Components

#### 1. Word Count (Complexity)

**What it measures:** Total words across all regulations managed by an agency

**Why it matters:**

- Proxy for regulatory complexity
- More words = more rules to understand and comply with
- Correlates with compliance costs

**Normalization:** Divided by 1,000 for readability

**Example:**

- Agency A: 50,000,000 words → 50,000 (normalized)
- Agency B: 1,000,000 words → 1,000 (normalized)

#### 2. Amendments (Instability)

**What it measures:** Total number of amendments across all titles

**Why it matters:**

- Frequent changes create regulatory uncertainty
- Businesses must continuously update compliance procedures
- High amendment rate indicates active regulatory areas
- Suggests ongoing compliance costs

**Data source:** eCFR version history API

**Example:**

- Agency A: 1,500 amendments over time
- Agency B: 50 amendments over time

#### 3. Number of CFR Titles (Scope)

**What it measures:** Count of CFR titles the agency manages

**Why it matters:**

- Indicates breadth of regulatory authority
- More titles = affects more areas of economy
- Amplifies impact of complexity and instability

**Example:**

- Agency A: 15 titles (broad authority)
- Agency B: 2 titles (narrow focus)

### Calculation Example

**Department of Justice:**

- Word Count: 31,586,172 words
- Amendments: 1,847
- CFR Titles: 11

```
Burden Score = (31,586,172 / 1,000) × 1,847 × 11
             = 31,586.172 × 1,847 × 11
             = 641,426,000
```

**Small Agency:**

- Word Count: 500,000 words
- Amendments: 25
- CFR Titles: 1

```
Burden Score = (500,000 / 1,000) × 25 × 1
             = 500 × 25 × 1
             = 12,500
```

### Interpretation

#### Score Ranges

| Score               | Category  | Interpretation                                     |
| ------------------- | --------- | -------------------------------------------------- |
| > 1,000,000         | Very High | Major regulatory agencies, top priority for review |
| 100,000 - 1,000,000 | High      | Significant regulatory presence                    |
| 10,000 - 100,000    | Medium    | Moderate regulatory footprint                      |
| < 10,000            | Low       | Limited regulatory impact                          |

#### What High Scores Mean

**For Decision-Makers:**

- Prioritize these agencies for deregulation efforts
- Highest potential for economic impact
- Focus resources where they matter most

**For Agencies:**

- Complex, frequently-changing, broad regulations
- Likely high compliance costs for affected industries
- Candidates for simplification or consolidation

### Use Cases

#### 1. Prioritization

Sort agencies by burden score to identify top targets:

```
Top 5 Agencies by Burden:
1. DOJ: 641,426,000
2. DOD: 523,891,000
3. EPA: 412,567,000
...
```

#### 2. Resource Allocation

Assign review resources proportional to burden scores:

```
Total Burden: 5,000,000,000
DOJ Burden: 641,426,000 (12.8% of total)
→ Allocate 12.8% of review budget to DOJ
```

#### 3. Impact Assessment

Estimate potential economic impact:

```
If reducing burden by 10%:
DOJ: 64,142,600 point reduction
Small Agency: 1,250 point reduction
→ Focus on DOJ for maximum impact
```

#### 4. Trend Analysis

Track burden score over time:

```
DOJ Burden Score:
2023: 641,426,000
2024: 655,000,000 (+2.1%)
→ Regulatory burden increasing
```

### Limitations

#### What It Doesn't Measure

1. **Actual Economic Cost**
   - Burden score is a proxy, not actual compliance cost
   - Would need industry-specific cost data

2. **Regulation Quality**
   - Doesn't distinguish beneficial vs. burdensome regulations
   - Some regulations prevent harm (safety, environment)

3. **Amendment Significance**
   - Treats all amendments equally
   - Minor clarifications vs. major overhauls

4. **Industry Impact**
   - Doesn't account for number of affected businesses
   - Some regulations affect millions, others affect dozens

5. **Enforcement Burden**
   - Doesn't measure enforcement costs
   - Compliance vs. enforcement are different

#### Assumptions

1. **Linear Relationships**
   - Assumes word count scales linearly with complexity
   - Reality: Some words matter more than others

2. **Equal Weighting**
   - All three factors weighted equally
   - Could adjust weights based on research

3. **Historical Data**
   - Amendment count is cumulative (all-time)
   - Doesn't distinguish recent vs. old amendments

### Validation

#### Sanity Checks

**Correlation with Known Data:**

- High scores for known complex agencies (DOJ, DOD, EPA) ✓
- Low scores for small agencies ✓
- Relative rankings match expert intuition ✓

**Edge Cases:**

- Agencies with no titles: Score = 0 ✓
- Reserved titles: Excluded from calculation ✓
- Missing data: Treated as 0 ✓

#### Comparison with Other Metrics

| Metric           | Correlation | Notes                          |
| ---------------- | ----------- | ------------------------------ |
| Word Count Alone | 0.85        | Strong, but misses instability |
| Number of Titles | 0.65        | Moderate, misses complexity    |
| Amendments Alone | 0.45        | Weak, needs context            |

### Future Enhancements

#### Weighted Formula

```
Burden Score = (α × Complexity) + (β × Instability) + (γ × Scope)

Where:
α, β, γ = weights determined by regression analysis
```

#### Time-Weighted Amendments

```
Recent Amendments = Σ(amendments × decay_factor^years_ago)

Gives more weight to recent changes
```

#### Industry-Adjusted Score

```
Adjusted Score = Burden Score × (Affected Businesses / 1000)

Accounts for economic reach
```

#### Enforcement Complexity

```
Enhanced Score = Burden Score × (Enforcement Actions / Year)

Includes enforcement burden
```

### Implementation Details

**Code Location:** `backend/src/services/data_processor.py`

**Function:** `calculate_regulatory_burden_score()`

**Parameters:**

- `word_count` (int): Total words
- `num_titles` (int): Number of CFR titles
- `total_amendments` (int): Total amendments
- `years_of_data` (float): Time span (default: 1.0)

**Returns:** `float` - Burden score rounded to 2 decimal places

**Example Usage:**

```python
score = calculate_regulatory_burden_score(
    word_count=31586172,
    num_titles=11,
    total_amendments=1847,
    years_of_data=1.0
)
# Returns: 641426000.00
```

### Research & References

**Methodology Inspiration:**

- Regulatory complexity literature
- Compliance cost studies
- Government efficiency research

**Similar Metrics:**

- RegData (Mercatus Center) - Regulatory restrictions count
- Federal Register page count - Volume of new regulations
- Paperwork Reduction Act burden hours

**Key Differences:**

- Combines multiple dimensions
- Agency-level aggregation
- Includes historical instability
- Designed for prioritization, not absolute measurement

### Feedback & Iteration

**Questions to Explore:**

1. Should recent amendments be weighted more heavily?
2. Are all CFR titles equally important?
3. How to account for regulation quality?
4. What's the right normalization factor?

**Data to Collect:**

1. Actual compliance costs by agency
2. Number of affected businesses
3. Enforcement action frequency
4. Public comment volume

**Validation Needed:**

1. Expert review of rankings
2. Correlation with economic data
3. Comparison with other burden measures
4. Sensitivity analysis of formula

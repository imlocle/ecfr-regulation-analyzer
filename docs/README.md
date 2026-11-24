# Documentation Index

Welcome to the eCFR Regulation Analyzer documentation. This directory contains comprehensive guides for understanding, deploying, and maintaining the application.

## Quick Links

### Assessment Submission

- **📋 [Submission Document](SUBMISSION.md)** - Assessment details, code metrics, development approach, and AI usage

### Getting Started

- **New to the project?** Start with [Architecture](ARCHITECTURE.md) to understand the system
- **Want to deploy?** Follow the [Deployment Guide](DEPLOYMENT.md)
- **Setting up locally?** Check the [Development Guide](DEVELOPMENT.md)

### Reference Documentation

- **API integration?** See [API Reference](API.md)
- **Understanding metrics?** Read [Custom Metrics](METRICS.md)
- **Security concerns?** Review [Security](SECURITY.md)

## Documentation Overview

### [Submission Document](SUBMISSION.md)

**What's inside:**

- Code metrics and line count breakdown
- Rationale for exceeding recommended limit
- Development duration and time breakdown
- Expertise and skillset alignment
- AI assistance usage and approach
- Design decisions and trade-offs
- Testing strategy
- Future enhancements

**Who should read:** Assessment reviewers, interviewers

**Time to read:** 10-15 minutes

---

### [Architecture](ARCHITECTURE.md)

**What's inside:**

- System architecture diagram
- Component descriptions (Frontend, Backend, Infrastructure)
- Data flow and processing pipeline
- Design decisions and trade-offs
- Scalability considerations
- Cost estimates
- Future enhancements

**Who should read:** Everyone - provides foundational understanding

**Time to read:** 15-20 minutes

---

### [API Reference](API.md)

**What's inside:**

- Complete endpoint documentation
- Request/response examples
- Error codes and handling
- Rate limits and caching
- Testing examples (cURL, JavaScript)
- Performance characteristics

**Who should read:** Frontend developers, API consumers, integration partners

**Time to read:** 10-15 minutes

---

### [Deployment Guide](DEPLOYMENT.md)

**What's inside:**

- Prerequisites and setup
- Step-by-step deployment instructions
- Environment configuration
- Rollback procedures
- Monitoring and troubleshooting
- Cost estimation
- Production readiness checklist

**Who should read:** DevOps engineers, deployment managers, system administrators

**Time to read:** 20-25 minutes

---

### [Development Guide](DEVELOPMENT.md)

**What's inside:**

- Local development setup
- Project structure
- Code style and conventions
- Testing strategies
- Debugging techniques
- Common development tasks
- Git workflow

**Who should read:** Developers contributing to the codebase

**Time to read:** 25-30 minutes

---

### [Custom Metrics](METRICS.md)

**What's inside:**

- Regulatory Burden Index explanation
- Formula and components
- Calculation examples
- Interpretation guidelines
- Use cases for decision-making
- Limitations and assumptions
- Future enhancements

**Who should read:** Product managers, policy analysts, assessment reviewers

**Time to read:** 15-20 minutes

---

### [Security](SECURITY.md)

**What's inside:**

- Current security posture
- Threat model
- Security best practices
- Production recommendations
- Compliance considerations (FISMA, FedRAMP)
- Incident response procedures
- Security checklist

**Who should read:** Security engineers, compliance officers, production deployment teams

**Time to read:** 20-25 minutes

---

## Documentation Standards

### Maintenance

- **Update frequency:** After major changes or quarterly
- **Review process:** Technical review before merging
- **Version control:** All docs in Git

### Contributing

When updating documentation:

1. Keep language clear and concise
2. Include code examples where helpful
3. Update table of contents if adding sections
4. Test all commands and code snippets
5. Add diagrams for complex concepts

### Feedback

Found an issue or have suggestions?

- Open a GitHub issue
- Submit a pull request
- Contact the team

## Additional Resources

### External Documentation

- [eCFR API Documentation](https://www.ecfr.gov/developers/documentation/api/v1)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [React Documentation](https://react.dev)

### Related Files

- [Main README](../README.md) - Project overview and quick start
- [Backend README](../backend/README.md) - Backend-specific details
- [Frontend package.json](../frontend/package.json) - Frontend dependencies

## Document Status

| Document      | Last Updated | Status     |
| ------------- | ------------ | ---------- |
| Submission    | 2026-03      | ✅ Current |
| Architecture  | 2026-03      | ✅ Current |
| API Reference | 2026-03      | ✅ Current |
| Deployment    | 2026-03      | ✅ Current |
| Development   | 2026-03      | ✅ Current |
| Metrics       | 2026-03      | ✅ Current |
| Security      | 2026-03      | ✅ Current |

## Quick Reference

### Common Commands

**Deploy to dev:**

```bash
npm run deploy
```

**Start local development:**

```bash
npm run dev
```

**View logs:**

```bash
aws logs tail /aws/lambda/ecfr-ingest-dev --follow
```

**Trigger ingestion:**

```bash
curl -X POST https://your-api-url/dev/ingest
```

### Key Concepts

- **Regulatory Burden Score:** Composite metric = (words/1000) × amendments × titles
- **Auto-Ingestion:** Automatically triggers when no data exists
- **Serverless:** No servers to manage, pay-per-use
- **Public Data:** All data from eCFR.gov (public domain)

### Support

**Questions?** Check the relevant documentation above or contact the team.

**Issues?** See troubleshooting sections in [Deployment](DEPLOYMENT.md) and [Development](DEVELOPMENT.md).

**Security concerns?** Review [Security](SECURITY.md) and contact security team.

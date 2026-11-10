# Deployment

## Preview vs Production
- Preview: Most up to date version for testing and developing the next newest version of the product. 
- Production: Most complete version of the product for customer usage. Public facing version but may not be completely up to date.

## Env Vars
- NEXT\_PUBLIC\_SUPABASE\_URL
- NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY
- REQUIRE\_LOGIN=false

## Issues
- Commit-Author Issue: Commit issues arised early on. Team members were
  originally unable to push changes to the newest deployment due to Vercel 
  requiring a paid subscription to add team members to a project. To
  work around this, the git repo was made public so that any team member
  has access to the Vercel project and can push their own deployments. 
- 7-day Pause: Supabase projects pause after 7 days of inactivity. Risks
  project deletion if not continuously checked. Not an issue for the
  preview but production is not updated as often and does have this risk
  of deletion due to inactivity. 

# Off-site presence and digital PR

This is a **manual checklist for the site owner**. Nothing here is automated by the
codebase, and no listing below exists until it is created by hand.

The goal is off-site signals: an insurance advisor is found through directories, insurer
pages and local references as much as through the website itself. Answer engines also
weigh these, because they corroborate the business entity against pages that are not ours.

## NAP consistency rule (read before creating any listing)

Every listing must use exactly these values, character for character. Copy them from
`src/config/site.ts`; never retype them from memory.

| Field | Value |
| --- | --- |
| Name | `AV Seguros Real` |
| Advisor | `Luis Adolfo Villarreal` |
| Phone / WhatsApp | `+52 1 81 2013 0995` |
| Email | `contacto@avsegurosreal.com` |
| Street | `Hacienda San Gabriel 310, Villas de la Hacienda` |
| City | `Juárez` |
| State | `Nuevo León` |
| Postal code | `67288` |
| Country | `México` |
| Website | `https://avsegurosreal.com` |
| Canonical link | `https://avsegurosreal.com/contacto/` |
| Bio link | `https://avsegurosreal.com/quienes-somos/` |

- Do not abbreviate the street, do not add a second phone number, and do not use a
  different domain (no `www`, no trailing slash on the bare domain in text fields).
- If a directory forces a "name" length limit, shorten the description, never the name.
- One address per profile. Do not create a second profile for another city.

## 1. Directory registration

| # | Listing | Why | Status | URL / notes |
| --- | --- | --- | --- | --- |
| 1 | Google Business Profile | Local pack, Maps, brand panel for the name | ☐ To do | Create at `business.google.com`; category "Insurance agency"; link to `/contacto/` |
| 2 | Bing Places for Business | Bing and Copilot local results | ☐ To do | Import from Google once #1 is verified |
| 3 | CONDUSEF public registry | Confirms the advisor and the agency legally exist | ☐ To do | Check the current registration; record the registry number |
| 4 | CNSF advisor registry | Source of the cédula 649610 cited on the site | ☐ To do | Confirm the cédula appears with the correct name |
| 5 | AXA agent / provider directory | Official insurer reference | ☐ To do | Ask the AXA account manager to list the adviser with the site URL |
| 6 | Afirme agent / provider directory | Official insurer reference | ☐ To do | Same request through the Afirme contact |
| 7 | TVAsesores agency page | Backing cited on `/quienes-somos/` | ☐ To do | Ask TVAsesores for a profile that links to the site |
| 8 | Apple Business Connect | Apple Maps and Siri results | ☐ Optional | Useful only if local searches matter |

For each entry record: **status** (to do / submitted / live / rejected), the **live URL**,
the **exact NAP used**, and the date it was checked.

## 2. Backlink checklist

The rule is that a link must be earned by being useful somewhere. No paid links, no link
exchanges, no directories that exist only to sell links.

| # | Target type | Example / who to contact | Ask for | Status |
| --- | --- | --- | --- | --- |
| 1 | Driving schools | Escuelas de manejo in Juárez, Guadalupe and Monterrey | A resource page recommendation on insurance for new drivers | ☐ |
| 2 | Used-car dealerships | Lots that sell with financing | "Te recomendamos con un asesor" link to `/seguros-de-auto/` | ☐ |
| 3 | New-car dealership groups | Agencies that hand over insurance leads | Referral link on their finance page | ☐ |
| 4 | Personal finance blogs and newsletters | Mexican finanzas personales sites | An interview or a quoted paragraph about deductibles | ☐ |
| 5 | Local chambers and business associations | CANACO, COPARMEX in the municipality | Member directory entry with the site URL | ☐ |
| 6 | Insurer partner pages | AXA / Afirme "encuentra un agente" pages | Listing with correct NAP | ☐ |
| 7 | Driver communities | Forums or groups for app and delivery drivers, where self-promotion is allowed | A useful answer, not an ad; link only where rules permit | ☐ |
| 8 | Press and interviews | Local newspapers, radio, podcasts | A mention with the canonical URL | ☐ |

For each row record: **target**, **contact**, **date asked**, **status**, **resulting URL**,
and whether the link is `follow` or `nofollow`.

Tips that keep this productive:

- Send a specific, short proposal: one paragraph, one link, one reason it helps their
  readers. Do not mass-mail.
- Offer something in return that costs nothing: a checklist, a glossary link, a printable
  guide from `/recursos/`.
- Check every new link within a month: many directories drop links silently.

## 3. The page that directories should point at

`/quienes-somos/` is the canonical citation target: it holds the advisor's bio, the family
history, the cédula and the TVAsesores backing, all taken from `site.ts`. Every directory,
press mention and partner page should link there, not to a PDF or a social profile.

`/prensa/` is the second reference: a short bio, the quotable facts and the official logo,
so a journalist never has to ask for a file.

## 4. Verification

- [ ] Google Business Profile verified, category and hours set, description and link to
      `/contacto/` in place, and at least five real photos uploaded.
- [ ] The sitemap has been accepted in Google Search Console and Bing Webmaster Tools.
- [ ] At least three live listings checked by hand: the NAP is identical to the table
      above and the link back to the site works.
- [ ] Every backlink recorded with its status and whether it is `follow`.
- [ ] No listing claims a certification, award, membership or insurer relationship the
      site does not state.

## 5. What not to do

- No paid link packages, "SEO packages", link farms or guest posts sold by the link.
- No fake reviews, no review swaps, no testimonials written by anyone but the client.
- No duplicate Google Business Profiles for the same address.
- No invented memberships, awards, rankings or "certified advisor" labels.
- No automated submission tools that post the same text to dozens of directories.

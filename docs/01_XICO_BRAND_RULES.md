# XICO Brand Rules

## Visual territory
Barragán × Casa Azul interior

Not the tourist-facing clichés.
Not the overused façade references.
Not folkloric shortcuts.

The feeling should be:
- dark
- warm
- architectural
- sophisticated
- contemporary
- ownable

## Avoid
- cliché Mexico
- Frida-merch aesthetics
- airport-Mexico branding
- childish gamification
- mascot logic that feels like Duolingo
- empty luxury cues
- generic editorial minimalism with no soul

## Color system
Use the XICO palette as a semantic system, not decoration.

- Magenta Barragán
- Ocre Casa Azul
- Cobalto Interior
- Terracota
- Verde Jardín
- Negro XICO

Suggested logic:
- Índice / entry / primary identity → magenta
- Cultura → cobalto
- México Ahora / gastronomía / actualidad → ocre
- Tradición / escénicas / materia → terracota
- Archivo / memory / private identity → verde or dark-base with restrained accents

## Typography
- Newsreader = editorial soul
- Inter = digital structure

The tension matters.
Newsreader carries literature, atmosphere, and depth — a contemporary
serif designed by David Jonathan Ross, with a slightly humanist italic
that reads as warm rather than institutional. Chosen over Cormorant
Garamond because Newsreader's display weights hold their shape at
monumental sizes (the Stop screen name at 64pt is the test) while
Cormorant's high contrast breaks down outside body text.
Inter carries interface, clarity, rhythm, and modernity.

The mobile codebase ships:
- Newsreader 300 Light / 400 Regular / 500 Medium / 600 SemiBold + italic variants
- Inter 300 Light / 400 Regular / 500 Medium / 600 SemiBold / 700 Bold

All defined as semantic tokens in `artifacts/xico-mobile/constants/editorial.ts:Fonts`.
Never hardcode font family strings in components — reference the token.

## Voice
XICO no informa. Revela.

The voice must feel:
- curious without pedantry
- elegant without coldness
- specific, not generic

## Writing rules
- Short sentences when the fact is strong.
- Full proper names always.
- Concrete numbers over vague approximations.
- No institutional jargon.
- No empty adjectives like “spectacular,” “incredible,” or “fascinating.”
- No more than 3 paragraphs without a vivid scene, image, or concrete detail.

## Brand test
If a sentence, screen, feature, or illustration could belong to any premium culture app, it is not yet XICO.
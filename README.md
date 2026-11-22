# Funky Drinks

A turn-based business strategy game: each player runs a sports-nutrition drinks company over 5 rounds and tries to finish with the strongest business. The game itself is in French.

It was my part of a team business strategy project at Sorbonne: I designed and built this web app.

**Play it:** https://funky-drinks.vercel.app

## How it plays

- **Products:** pick a line from the PowerFuel range (Lean, Bulk, Performance, Protein), each with its own market.
- **Pricing:** low, mid or premium, trading volume against margin.
- **Levers:** invest in R&D (quality), brand, production capacity or diversification, with adjustable budgets.
- **Financing:** take a loan when cash runs short, repaid with interest over 3 rounds.
- **Market events:** every round brings an event (heatwave, harsh winter, economic crisis or recovery, a new nutrition law, an ingredient tax, a fitness boom...) that shifts demand.
- **Results:** a recap after each round, then a leaderboard.

The simulation (demand, competition, capacity, costs, cash) is in `src/lib/simulate.ts`, and every tunable number is in `src/lib/config.ts`.

## Run it locally

```sh
npm install
npm run dev
```

Built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui.

## License

MIT, see [LICENSE](LICENSE).

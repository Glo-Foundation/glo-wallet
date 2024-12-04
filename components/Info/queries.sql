-- get for last month
SELECT
  blockchain,
  amount,
  block_date,
  block_month,
  tx_from,
  tx_to
FROM tokens.transfers
WHERE
  symbol = 'USDGLO' AND block_month = TRY_CAST('2024-09-01' AS DATE)
ORDER BY
  amount DESC
LIMIT 10


-- Get leaderboard
SELECT
  blockchain,
  amount,
  tx_from,
  tx_to
FROM tokens.transfers
WHERE
  symbol = 'USDGLO'
ORDER BY amount DESC
LIMIT 10
query durations between movements:

```mongodb-json
use chess-ai-battle
db.movements.aggregate([
    {
        $match: { lapId: "300" }
    },
    {
        $sort: { movedAt: 1 }
    },
    {
        $group: {
            _id: null,
            docs: { $push: "$$ROOT" }
        }
    },
    {
        $addFields: {
            allMovedAt: "$docs.movedAt"
        }
    },
    {
        $unwind: {
            path: "$docs",
            includeArrayIndex: "index"
        }
    },
    {
        $project: {
            notation: "$docs.notation",
            movedAt: "$docs.movedAt",
            nextMovedAt: {
                $arrayElemAt: ["$allMovedAt", { $add: ["$index", 1] }]
            }
        }
    },
    {
        $match: { nextMovedAt: { $ne: null } }
    },
    {
        $project: {
            notation: 1,
            movedAt: 1,
            durationMillis: {
                $subtract: ["$nextMovedAt", "$movedAt"]
            },
            _id: 0
        }
    }
])
```

import { CollectionUtil } from "./collection"

describe("Collection utility tests", () => {

    test("Test computeIfAbsent computes absent values", () => {
        const key = {}
        const value = {}
        let callCount = 0

        const map = new Map<object, object>()

        const result = CollectionUtil.computeIfAbsent(map, key, () => {
            callCount++
            return value
        })
        expect(callCount).toEqual(1)
        expect(result).toBe(value)
        expect(map.get(key)).toBe(value)
        expect(map.size).toBe(1)
    })

    test("Test computeIfAbsent only computes absent values", () => {
        const key = {}
        const value = {}
        let callCount = 0

        const map = new Map<object, object>()
        map.set(key, value)

        const result = CollectionUtil.computeIfAbsent(map, key, () => {
            callCount++
            return {}
        })
        expect(callCount).toEqual(0)
        expect(result).toBe(value)
        expect(map.get(key)).toBe(value)
        expect(map.size).toBe(1)
    })
})

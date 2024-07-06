/**Draw sampleSize random items from the given array.
 * 
 * @template T
 * @param {T[]} arr the array
 * @param {number} sampleSize the number of items to return
 * @returns {T[]} a new array
 */
export function sampleWithoutReplacement(arr, sampleSize) {
    let selected = 0;
    let dealtWith = 0;

    const result = [];

    while (selected < sampleSize)
    {
        const uniform = Math.random();

        if (uniform * (arr.length - dealtWith) >= sampleSize - selected) {
            dealtWith++;
        } else {
            result.push(arr[dealtWith]);
            selected++;
            dealtWith++;
        }
    }

    console.dir(result, {depth: 5});

    return result;
}

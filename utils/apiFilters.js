class APIFilters {
  constructor(query, queryStr) {
    this.query = query // Product modeline bakacak. Başlangıçta tüm ürünler, sonradan filtrelenmiş ürünler olacak.
    this.queryStr = queryStr
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: 'i', // Küçük veya büyük harf fark etmeyecek.
          },
        }
      : {} // Name eşleşmiyorsa boş obje.

    this.query = this.query.find({ ...keyword })
    return this
  }

  filters() {
    const queryCopy = { ...this.queryStr }
    const fieldsToRemove = ['keyword', 'page']
    fieldsToRemove.forEach((el) => delete queryCopy[el])

    // colors filtresini ekleyin (örnek olarak renk filtresi)
    if (queryCopy.colors) {
      // colors filtresi varsa
      this.query = this.query.find({
        colors: {
          $elemMatch: {
            color: queryCopy.colors, // Burada istediğiniz filtreyi ayarlayın
          },
        },
      })
      delete queryCopy.colors // colors filtresini queryCopy'den çıkartalım
    }

    let queryStr = JSON.stringify(queryCopy)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    this.query = this.query.find(JSON.parse(queryStr))
    return this
  }

  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1
    const skip = resPerPage * (currentPage - 1)

    this.query = this.query.limit(resPerPage).skip(skip)
    return this
  }
}

export default APIFilters

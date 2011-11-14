if (!VIE.prototype.view) {
    VIE.prototype.view = {};
}

VIE.prototype.view.Collection = Backbone.View.extend({
    // Ensure the collection view gets updated when items get added or removed
    initialize: function() {
        this.template = this.options.template;
        this.service = this.options.service;
        if (!this.service) {
            throw "No RDFa service provided to the Collection View";
        }

        this.entityViews = {};
        _.bindAll(this, 'addItem', 'removeItem', 'refreshItems');
        this.collection.bind('add', this.addItem);
        this.collection.bind('remove', this.removeItem);

        // Make the view aware of existing entities in collection
        var view = this;
        this.collection.forEach(function(entity) {
            view.registerItem(entity, view.collection);
        });
    },

    addItem: function(entity, collection) {
        if (collection !== this.collection) {
            return;
        }

        if (!this.template || this.template.length === 0) {
            return;
        }

        var entityView = this.service._registerEntityView(entity, this.cloneElement(this.template));
        var entityElement = entityView.render().el;
        if (entity.id) {
            this.service.setElementSubject(entity.getSubjectUri(), entityElement);
        }

        // TODO: Ordering
        this.el.append(entityElement);

        // Ensure we catch all inferred predicates. We add these via JSONLD
        // so the references get properly Collectionized.
        var service = this.service;
        jQuery(entityElement).parent('[rev]').each(function() {
            var predicate = jQuery(this).attr('rev');
            var relations = {};
            relations[predicate] = new service.vie.Collection();
            relations[predicate].addOrUpdate(service.vie.entities.get(service.getElementSubject(this)));
            entity.set(relations);
        });
        
        this.trigger('add', entityView);
        this.entityViews[entity.cid] = entityView;
        entityElement.show();
    },

    registerItem: function(entity, collection) {
        var element = this.service.getElementBySubject(entity.id, this.el);
        if (!element) {
            return;
        }

        var entityView = this.service._registerEntityView(entity, element);
        this.entityViews[entity.cid] = entityView;
    },

    removeItem: function(entity) {
        if (!this.entityViews[entity.cid]) {
            return;
        }

        this.trigger('remove', this.entityViews[entity.cid]);
        this.entityViews[entity.cid].el.remove();
        delete(this.entityViews[entity.cid]);
    },

    refreshItems: function(collection) {
        var view = this;
        jQuery(this.el).empty();
        collection.forEach(function(entity) {
            view.addItem(entity, collection);
        });
    },

    cloneElement: function(element) {
        var newElement = jQuery(element).clone(false);
        var service = this.service;
        if (typeof newElement.attr('about') !== 'undefined') {
            // Direct match with container
            newElement.attr('about', '');
        }
        newElement.find('[about]').attr('about', '');
        var subject = this.service.getElementSubject(newElement);
        service._findPredicateElements(subject, newElement, false).each(function() {
            service.writeElementValue(null, jQuery(this), '');
        });
        return newElement;
    }
});
